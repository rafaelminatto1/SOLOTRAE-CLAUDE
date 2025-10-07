#!/bin/bash

# Script para configurar variáveis de ambiente na Vercel
echo "Configurando variáveis de ambiente na Vercel..."

# Variáveis do Frontend
echo "Configurando VITE_SUPABASE_URL..."
vercel env add VITE_SUPABASE_URL production <<< "https://ixevreqkdliucbsrqviy.supabase.co"

echo "Configurando VITE_SUPABASE_ANON_KEY..."
vercel env add VITE_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZXZyZXFrZGxpdWNic3Jxdml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODIzNzEsImV4cCI6MjA3MjM1ODM3MX0.GXN1qovqdFAjD9c4AJIhrsKBRl7pJb67CE2-6In48IA"

echo "Configurando VITE_API_URL..."
vercel env add VITE_API_URL production <<< "https://solotrae.vercel.app/api"

echo "Configurando VITE_NODE_ENV..."
vercel env add VITE_NODE_ENV production <<< "production"

# Variáveis do Backend
echo "Configurando SUPABASE_URL..."
vercel env add SUPABASE_URL production <<< "https://ixevreqkdliucbsrqviy.supabase.co"

echo "Configurando SUPABASE_ANON_KEY..."
vercel env add SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZXZyZXFrZGxpdWNic3Jxdml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODIzNzEsImV4cCI6MjA3MjM1ODM3MX0.GXN1qovqdFAjD9c4AJIhrsKBRl7pJb67CE2-6In48IA"

echo "Configurando SUPABASE_SERVICE_ROLE_KEY..."
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZXZyZXFrZGxpdWNic3Jxdml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc4MjM3MSwiZXhwIjoyMDcyMzU4MzcxfQ.u2FNKpzD0eOO4FXm6B6M36PZo018NjVbrQeLp8NAi0k"

echo "Configurando JWT_SECRET..."
vercel env add JWT_SECRET production <<< "fisioflow-jwt-secret-key-2024"

echo "Configurando FLASK_ENV..."
vercel env add FLASK_ENV production <<< "production"

echo "Configurando PYTHONPATH..."
vercel env add PYTHONPATH production <<< "/var/task"

echo "Configurando NODE_ENV..."
vercel env add NODE_ENV production <<< "production"

echo "✅ Todas as variáveis de ambiente foram configuradas!"
echo "🔗 URL do projeto: https://solotrae.vercel.app"
echo "📊 Dashboard Vercel: https://vercel.com/rafael-minattos-projects/solotrae"
echo "🗄️ Dashboard Supabase: https://supabase.com/dashboard/project/ixevreqkdliucbsrqviy"
