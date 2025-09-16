# -*- coding: utf-8 -*-
"""
Supabase Configuration - FisioFlow Backend
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class SupabaseConfig:
    def __init__(self):
        self.url = os.getenv('SUPABASE_URL')
        self.key = os.getenv('SUPABASE_ANON_KEY')
        self.service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not self.url or not self.key:
            logger.warning("Supabase não configurado - usando modo simulação")
            self.client = None
            self.simulation_mode = True
        else:
            try:
                self.client = create_client(self.url, self.key)
                self.simulation_mode = False
                logger.info("Cliente Supabase inicializado com sucesso")
            except Exception as e:
                logger.error(f"Erro ao inicializar Supabase: {e}")
                self.client = None
                self.simulation_mode = True
    
    def get_client(self) -> Client:
        """Obter cliente Supabase"""
        return self.client
    
    def is_connected(self) -> bool:
        """Verificar se está conectado ao Supabase"""
        return self.client is not None and not self.simulation_mode
    
    def test_connection(self) -> dict:
        """Testar conexão com Supabase"""
        if self.simulation_mode:
            return {
                "status": "simulation",
                "message": "Modo simulação ativo - Configure SUPABASE_URL e SUPABASE_ANON_KEY"
            }
        
        try:
            # Testar conexão fazendo uma query simples
            result = self.client.table('settings').select('*').limit(1).execute()
            return {
                "status": "connected",
                "message": "Conexão com Supabase estabelecida com sucesso",
                "data": result.data
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Erro ao conectar com Supabase: {str(e)}"
            }

# Instância global
supabase_config = SupabaseConfig()

# Funções de conveniência
def get_supabase_client() -> Client:
    """Obter cliente Supabase"""
    return supabase_config.get_client()

def is_supabase_connected() -> bool:
    """Verificar se Supabase está conectado"""
    return supabase_config.is_connected()

def test_supabase_connection() -> dict:
    """Testar conexão com Supabase"""
    return supabase_config.test_connection()
