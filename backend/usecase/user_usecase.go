package usecase

import (
	"context"
	"errors"
	"fmt"
	"time"

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
	// ErrEmailNotVerified はメールアドレスが未検証の場合のエラー
	ErrEmailNotVerified = errors.New("email not verified")
	// ErrInvalidVerificationToken は検証トークンが不正な場合のエラー
	ErrInvalidVerificationToken = errors.New("invalid or expired verification token")
)

// UserUsecaseInterface はUserUsecaseのインターフェース。
// テスト時のモック作成に使用する。
type UserUsecaseInterface interface {
	Register(ctx context.Context, email, password string) (*entity.User, error)
	Login(ctx context.Context, email, password string) (*entity.User, string, error)
	Logout(ctx context.Context, sessionID string) error
	GetUser(ctx context.Context, userID uuid.UUID) (*entity.User, error)
	ChangePassword(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error
	VerifyEmail(ctx context.Context, token string) error
	ResendVerificationEmail(ctx context.Context, email string) error
}

// UserUsecase はユーザーに関するビジネスロジックを提供する。
type UserUsecase struct {
	userRepo    repository.UserRepository
	userService *service.UserService
	sessionRepo repository.SessionRepository
	emailSender repository.EmailSender
	sessionTTL  time.Duration
}

// NewUserUsecase はUserUsecaseの新しいインスタンスを生成する。
func NewUserUsecase(
	userRepo repository.UserRepository,
	userService *service.UserService,
	sessionRepo repository.SessionRepository,
	emailSender repository.EmailSender,
	sessionTTL time.Duration,
) *UserUsecase {
	return &UserUsecase{
		userRepo:    userRepo,
		userService: userService,
		sessionRepo: sessionRepo,
		emailSender: emailSender,
		sessionTTL:  sessionTTL,
	}
}

// Register はユーザー登録を行い、確認メールを送信する。
func (u *UserUsecase) Register(ctx context.Context, email, password string) (*entity.User, error) {
	emailVO, err := value.NewEmail(email)
	if err != nil {
		return nil, err
	}

	if err := u.userService.CheckEmailUniqueness(ctx, emailVO); err != nil {
		return nil, err
	}

	user, err := entity.NewUser(email, password)
	if err != nil {
		return nil, err
	}

	if err := u.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	// 確認メールを送信（失敗してもユーザー登録は成功とする）
	if user.VerificationToken != nil {
		if sendErr := u.emailSender.SendVerificationEmail(ctx, email, user.VerificationToken.String()); sendErr != nil {
			// ログは EmailSender 内で記録される
			return user, nil
		}
	}

	return user, nil
}

// Login はログイン処理を行う。メール未検証の場合はエラーを返す。
func (u *UserUsecase) Login(ctx context.Context, email, password string) (*entity.User, string, error) {
	emailVO, err := value.NewEmail(email)
	if err != nil {
		return nil, "", ErrInvalidCredentials
	}

	user, err := u.userRepo.FindByEmail(ctx, emailVO.String())
	if err != nil {
		return nil, "", ErrInvalidCredentials
	}

	if user == nil {
		return nil, "", ErrInvalidCredentials
	}

	if err := user.VerifyPassword(password); err != nil {
		return nil, "", ErrInvalidCredentials
	}

	// メール検証チェック
	if !user.EmailVerified {
		return nil, "", ErrEmailNotVerified
	}

	sessionID, err := u.sessionRepo.Create(ctx, user.ID, u.sessionTTL)
	if err != nil {
		return nil, "", fmt.Errorf("failed to create session: %w", err)
	}

	return user, sessionID, nil
}

// VerifyEmail はメール検証を完了する。
func (u *UserUsecase) VerifyEmail(ctx context.Context, token string) error {
	if token == "" {
		return ErrInvalidVerificationToken
	}

	user, err := u.userRepo.FindByVerificationToken(ctx, token)
	if err != nil {
		return fmt.Errorf("failed to find user by token: %w", err)
	}
	if user == nil {
		return ErrInvalidVerificationToken
	}

	// トークン有効期限チェック
	if user.VerificationToken != nil && user.VerificationToken.IsExpired() {
		return ErrInvalidVerificationToken
	}

	user.VerifyEmail()

	if err := u.userRepo.Update(ctx, user); err != nil {
		return fmt.Errorf("failed to verify email: %w", err)
	}

	return nil
}

// ResendVerificationEmail は確認メールを再送する。
// セキュリティ上、メールアドレスの存在有無に関わらず同じレスポンスを返す。
func (u *UserUsecase) ResendVerificationEmail(ctx context.Context, email string) error {
	emailVO, err := value.NewEmail(email)
	if err != nil {
		return nil // メール形式が不正でもエラーを返さない
	}

	user, err := u.userRepo.FindByEmail(ctx, emailVO.String())
	if err != nil || user == nil {
		return nil // ユーザーが存在しなくてもエラーを返さない
	}

	if user.EmailVerified {
		return nil // 既に検証済み
	}

	if err := user.RegenerateVerificationToken(); err != nil {
		return fmt.Errorf("failed to regenerate token: %w", err)
	}

	if err := u.userRepo.Update(ctx, user); err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	if user.VerificationToken != nil {
		if err := u.emailSender.SendVerificationEmail(ctx, email, user.VerificationToken.String()); err != nil {
			return fmt.Errorf("failed to send verification email: %w", err)
		}
	}

	return nil
}

// GetUser はユーザー情報を取得する。
func (u *UserUsecase) GetUser(ctx context.Context, userID uuid.UUID) (*entity.User, error) {
	user, err := u.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	return user, nil
}

// ChangePassword はパスワード変更を行う。
func (u *UserUsecase) ChangePassword(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error {
	user, err := u.userRepo.FindByID(ctx, userID)
	if err != nil {
		return ErrUserNotFound
	}

	if err := user.VerifyPassword(currentPassword); err != nil {
		return ErrInvalidCredentials
	}

	if err := user.UpdatePassword(newPassword); err != nil {
		return err
	}

	if err := u.userRepo.Update(ctx, user); err != nil {
		return err
	}

	return nil
}

// Logout はログアウト処理を行う。
func (u *UserUsecase) Logout(ctx context.Context, sessionID string) error {
	return u.sessionRepo.Delete(ctx, sessionID)
}
