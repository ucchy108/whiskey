package service

import (
	"context"

	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/domain/value"
)

// UserService はユーザーに関するドメインサービス
// エンティティ単体では実現できないドメインロジックを提供する
type UserService struct {
	userRepo repository.UserRepository
}

// NewUserService はUserServiceを生成する
func NewUserService(userRepo repository.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// CheckEmailUniqueness はメールアドレスのユニーク性を検証する
// 既に同じメールアドレスが登録されている場合はvalue.ErrEmailAlreadyExistsを返す
func (s *UserService) CheckEmailUniqueness(ctx context.Context, email value.Email) error {
	// リポジトリでメールアドレスの存在確認
	exists, err := s.userRepo.ExistsByEmail(ctx, email.String())
	if err != nil {
		return err
	}

	// 既に存在する場合はエラーを返す
	if exists {
		return value.ErrEmailAlreadyExists
	}

	return nil
}
