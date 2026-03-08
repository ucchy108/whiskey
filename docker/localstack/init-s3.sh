#!/bin/bash
# LocalStack 起動後に S3 バケットを作成する初期化スクリプト

awslocal s3 mb s3://whiskey-avatars
awslocal s3api put-bucket-cors --bucket whiskey-avatars --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT"],
      "AllowedOrigins": ["http://localhost:3000"],
      "MaxAgeSeconds": 3600
    }
  ]
}'

echo "S3 bucket 'whiskey-avatars' created successfully"
