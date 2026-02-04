package usecase

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/domain/service"
	"github.com/ucchy108/whiskey/backend/domain/value"
)

var (
	// ErrUserNotFound はユーザーが見つからない場合のエラー
	ErrUserNotFound = errors.New("user not found")
	// ErrInvalidCredentials は認証情報が無効な場合のエラー
	ErrInvalidCredentials = errors.New("invalid credentials")
)

// UserUsecaseInterface はUserUsecaseのインターフェース。
// テスト時のモック作成に使用する。
type UserUsecaseInterface interface {
	Register(ctx context.Context, email, password string) (*entity.User, error)
	Login(ctx context.Context, email, password string) (*entity.User, error)
	GetUser(ctx context.Context, userID uuid.UUID) (*entity.User, error)
	ChangePassword(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error
}

// UserUsecase はユーザーに関するビジネスロジックを提供する。
// ユーザー登録、ログイン、情報取得、パスワード変更などのユースケースを実装する。
type UserUsecase struct {
	userRepo    repository.UserRepository
	userService *service.UserService
}

// NewUserUsecase はUserUsecaseの新しいインスタンスを生成する。
//
// パラメータ:
//   - userRepo: ユーザーデータの永続化を担当するリポジトリ
//   - userService: メールアドレスのユニーク性チェックなどのドメインサービス
//
// 戻り値:
//   - *UserUsecase: 生成されたUserUsecaseインスタンス
func NewUserUsecase(userRepo repository.UserRepository, userService *service.UserService) *UserUsecase {
	return &UserUsecase{
		userRepo:    userRepo,
		userService: userService,
	}
}

// Register はユーザー登録を行う。
// メールアドレスの重複チェック、パスワードのバリデーション、ハッシュ化を実施し、ユーザーを永続化する。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - email: 登録するメールアドレス（形式バリデーションが実施される）
//   - password: 登録するパスワード（8文字以上72文字以下、ハッシュ化される）
//
// 戻り値:
//   - *entity.User: 登録されたユーザーエンティティ
//   - error: 以下のエラーが返される可能性がある
//     - value.ErrInvalidEmail: メールアドレス形式が不正
//     - value.ErrEmailAlreadyExists: メールアドレスが既に登録済み
//     - value.ErrPasswordTooShort: パスワードが短すぎる
//     - value.ErrPasswordTooLong: パスワードが長すぎる
//     - その他のリポジトリエラー
func (u *UserUsecase) Register(ctx context.Context, email, password string) (*entity.User, error) {
	// Email値オブジェクトの生成（バリデーション含む）
	emailVO, err := value.NewEmail(email)
	if err != nil {
		return nil, err
	}

	// メールアドレスのユニーク性チェック（ドメインサービス）
	if err := u.userService.CheckEmailUniqueness(ctx, emailVO); err != nil {
		return nil, err
	}

	// エンティティ作成（パスワードのバリデーション・ハッシュ化含む）
	user, err := entity.NewUser(email, password)
	if err != nil {
		return nil, err
	}

	// 永続化
	if err := u.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

// Login はログイン処理を行う。
// メールアドレスとパスワードを検証し、認証に成功したユーザーを返す。
// セキュリティ上、ユーザーの存在確認とパスワードの不一致を区別せず、同じエラーを返す。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - email: ログインに使用するメールアドレス
//   - password: ログインに使用するパスワード
//
// 戻り値:
//   - *entity.User: 認証に成功したユーザーエンティティ
//   - error: 以下のエラーが返される可能性がある
//     - ErrInvalidCredentials: メールアドレスまたはパスワードが不正
//     - その他のリポジトリエラー
func (u *UserUsecase) Login(ctx context.Context, email, password string) (*entity.User, error) {
	// Email値オブジェクトの生成（バリデーション含む）
	emailVO, err := value.NewEmail(email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// ユーザーをメールアドレスで検索
	user, err := u.userRepo.FindByEmail(ctx, emailVO.String())
	if err != nil {
		// ユーザーが存在しない場合も認証失敗として扱う
		// （セキュリティ上、存在確認を悪用されないようにするため）
		return nil, ErrInvalidCredentials
	}

	// パスワード検証
	if err := user.VerifyPassword(password); err != nil {
		return nil, ErrInvalidCredentials
	}

	return user, nil
}

// GetUser はユーザー情報を取得する。
// 指定されたユーザーIDに対応するユーザーエンティティを返す。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: 取得するユーザーのID
//
// 戻り値:
//   - *entity.User: 取得したユーザーエンティティ
//   - error: 以下のエラーが返される可能性がある
//     - ErrUserNotFound: 指定されたIDのユーザーが存在しない
//     - その他のリポジトリエラー
func (u *UserUsecase) GetUser(ctx context.Context, userID uuid.UUID) (*entity.User, error) {
	user, err := u.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	return user, nil
}

// ChangePassword はパスワード変更を行う。
// 現在のパスワードを検証し、新しいパスワードに更新する。
// セキュリティのため、パスワード変更には現在のパスワードの入力が必要となる。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: パスワードを変更するユーザーのID
//   - currentPassword: 現在のパスワード（検証に使用）
//   - newPassword: 新しいパスワード（8文字以上72文字以下、ハッシュ化される）
//
// 戻り値:
//   - error: 以下のエラーが返される可能性がある
//     - ErrUserNotFound: 指定されたIDのユーザーが存在しない
//     - ErrInvalidCredentials: 現在のパスワードが不正
//     - value.ErrPasswordTooShort: 新しいパスワードが短すぎる
//     - value.ErrPasswordTooLong: 新しいパスワードが長すぎる
//     - その他のリポジトリエラー
func (u *UserUsecase) ChangePassword(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error {
	// ユーザー取得
	user, err := u.userRepo.FindByID(ctx, userID)
	if err != nil {
		return ErrUserNotFound
	}

	// 現在のパスワード検証
	if err := user.VerifyPassword(currentPassword); err != nil {
		return ErrInvalidCredentials
	}

	// 新しいパスワードに更新（エンティティ内でバリデーション・ハッシュ化）
	if err := user.UpdatePassword(newPassword); err != nil {
		return err
	}

	// 永続化
	if err := u.userRepo.Update(ctx, user); err != nil {
		return err
	}

	return nil
}
