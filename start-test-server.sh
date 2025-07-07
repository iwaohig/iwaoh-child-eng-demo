#!/bin/bash

echo "ローカルHTTPサーバーを起動します..."
echo "フォームテストURL: http://localhost:8000/test-form-page.html"
echo "元のフォームURL: http://localhost:8000/sample/bestudio-form-replica.html"
echo ""
echo "Ctrl+C で停止"
echo ""

# PythonでシンプルなHTTPサーバーを起動
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "Pythonが見つかりません。Node.js httpサーバーを試します..."
    if command -v npx &> /dev/null; then
        npx http-server -p 8000
    else
        echo "HTTPサーバーを起動できません。Pythonまたはnpxが必要です。"
        exit 1
    fi
fi