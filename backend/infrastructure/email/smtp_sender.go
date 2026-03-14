// Package email はメール送信のインフラストラクチャ実装を提供する。
package email

import (
	"context"
	"fmt"
	"net/smtp"

	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/pkg/logger"
)

// SmtpSender はSMTPを使用したメール送信の実装
type SmtpSender struct {
	host        string
	port        string
	frontendURL string
}

// NewSmtpSender はSmtpSenderの新しいインスタンスを生成する
func NewSmtpSender(host, port, frontendURL string) repository.EmailSender {
	return &SmtpSender{
		host:        host,
		port:        port,
		frontendURL: frontendURL,
	}
}

// SendVerificationEmail は検証メールを送信する
func (s *SmtpSender) SendVerificationEmail(_ context.Context, toEmail string, token string) error {
	verifyURL := fmt.Sprintf("%s/verify-email?token=%s", s.frontendURL, token)

	subject := "【whiskey】メールアドレスの確認"
	body := fmt.Sprintf(`以下のリンクをクリックして、メールアドレスの確認を完了してください。

%s

このリンクは24時間有効です。
心当たりがない場合は、このメールを無視してください。`, verifyURL)

	msg := fmt.Sprintf("From: noreply@whiskey.app\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n%s",
		toEmail, subject, body)

	addr := fmt.Sprintf("%s:%s", s.host, s.port)
	if err := smtp.SendMail(addr, nil, "noreply@whiskey.app", []string{toEmail}, []byte(msg)); err != nil {
		logger.Error("Failed to send verification email", "to", toEmail, "error", err)
		return fmt.Errorf("failed to send verification email: %w", err)
	}

	logger.Info("Verification email sent", "to", toEmail)
	return nil
}
