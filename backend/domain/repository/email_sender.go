package repository

import "context"

// EmailSender はメール送信のインターフェース
type EmailSender interface {
	// SendVerificationEmail は検証メールを送信する
	SendVerificationEmail(ctx context.Context, toEmail string, token string) error
}
