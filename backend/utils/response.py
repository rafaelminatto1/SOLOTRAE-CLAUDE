# -*- coding: utf-8 -*-
"""
Utilitários de Resposta da API - FisioFlow Backend

Este módulo contém classes e funções para padronizar
as respostas da API, incluindo formatação, paginação
e tratamento de erros.
"""

from typing import Any, Dict, List, Optional, Union
from flask import jsonify, request
from datetime import datetime
import math

class APIResponse:
    """Classe para padronizar respostas da API"""
    
    @staticmethod
    def success(
        data: Any = None,
        message: str = "Operação realizada com sucesso",
        status_code: int = 200,
        meta: Optional[Dict[str, Any]] = None
    ) -> tuple:
        """Resposta de sucesso"""
        response = {
            'success': True,
            'message': message,
            'timestamp': datetime.utcnow().isoformat(),
            'status_code': status_code
        }
        
        if data is not None:
            response['data'] = data
        
        if meta:
            response['meta'] = meta
        
        return jsonify(response), status_code
    
    @staticmethod
    def error(
        message: str = "Erro interno do servidor",
        status_code: int = 500,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> tuple:
        """Resposta de erro"""
        response = {
            'success': False,
            'message': message,
            'timestamp': datetime.utcnow().isoformat(),
            'status_code': status_code
        }
        
        if error_code:
            response['error_code'] = error_code
        
        if details:
            response['details'] = details
        
        return jsonify(response), status_code
    
    @staticmethod
    def validation_error(
        errors: Union[str, List[str], Dict[str, Any]],
        message: str = "Dados inválidos"
    ) -> tuple:
        """Resposta de erro de validação"""
        return APIResponse.error(
            message=message,
            status_code=400,
            error_code="VALIDATION_ERROR",
            details={'validation_errors': errors}
        )
    
    @staticmethod
    def not_found(
        resource: str = "Recurso",
        message: Optional[str] = None
    ) -> tuple:
        """Resposta de recurso não encontrado"""
        if not message:
            message = f"{resource} não encontrado"
        
        return APIResponse.error(
            message=message,
            status_code=404,
            error_code="NOT_FOUND"
        )
    
    @staticmethod
    def unauthorized(
        message: str = "Acesso não autorizado"
    ) -> tuple:
        """Resposta de não autorizado"""
        return APIResponse.error(
            message=message,
            status_code=401,
            error_code="UNAUTHORIZED"
        )
    
    @staticmethod
    def forbidden(
        message: str = "Acesso negado"
    ) -> tuple:
        """Resposta de acesso negado"""
        return APIResponse.error(
            message=message,
            status_code=403,
            error_code="FORBIDDEN"
        )
    
    @staticmethod
    def conflict(
        message: str = "Conflito de dados",
        details: Optional[Dict[str, Any]] = None
    ) -> tuple:
        """Resposta de conflito"""
        return APIResponse.error(
            message=message,
            status_code=409,
            error_code="CONFLICT",
            details=details
        )
    
    @staticmethod
    def rate_limit_exceeded(
        message: str = "Muitas requisições. Tente novamente mais tarde."
    ) -> tuple:
        """Resposta de limite de taxa excedido"""
        return APIResponse.error(
            message=message,
            status_code=429,
            error_code="RATE_LIMIT_EXCEEDED"
        )
    
    @staticmethod
    def created(
        data: Any = None,
        message: str = "Recurso criado com sucesso",
        location: Optional[str] = None
    ) -> tuple:
        """Resposta de recurso criado"""
        response, status_code = APIResponse.success(
            data=data,
            message=message,
            status_code=201
        )
        
        if location:
            response.headers['Location'] = location
        
        return response, status_code
    
    @staticmethod
    def no_content(
        message: str = "Operação realizada com sucesso"
    ) -> tuple:
        """Resposta sem conteúdo"""
        return APIResponse.success(
            message=message,
            status_code=204
        )

class PaginationHelper:
    """Helper para paginação de resultados"""
    
    def __init__(
        self,
        page: int = 1,
        per_page: int = 20,
        max_per_page: int = 100
    ):
        self.page = max(1, page)
        self.per_page = min(max(1, per_page), max_per_page)
        self.max_per_page = max_per_page
    
    @classmethod
    def from_request(cls, max_per_page: int = 100) -> 'PaginationHelper':
        """Criar paginação a partir dos parâmetros da requisição"""
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        return cls(page=page, per_page=per_page, max_per_page=max_per_page)
    
    def paginate_query(self, query):
        """Paginar query do SQLAlchemy"""
        return query.paginate(
            page=self.page,
            per_page=self.per_page,
            error_out=False
        )
    
    def get_pagination_meta(self, pagination) -> Dict[str, Any]:
        """Obter metadados de paginação"""
        return {
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_prev': pagination.has_prev,
                'has_next': pagination.has_next,
                'prev_num': pagination.prev_num,
                'next_num': pagination.next_num
            }
        }
    
    def paginate_list(self, items: List[Any]) -> Dict[str, Any]:
        """Paginar lista de itens"""
        total = len(items)
        pages = math.ceil(total / self.per_page)
        
        start = (self.page - 1) * self.per_page
        end = start + self.per_page
        
        paginated_items = items[start:end]
        
        has_prev = self.page > 1
        has_next = self.page < pages
        
        return {
            'items': paginated_items,
            'pagination': {
                'page': self.page,
                'per_page': self.per_page,
                'total': total,
                'pages': pages,
                'has_prev': has_prev,
                'has_next': has_next,
                'prev_num': self.page - 1 if has_prev else None,
                'next_num': self.page + 1 if has_next else None
            }
        }

class DataFormatter:
    """Formatador de dados para respostas"""
    
    @staticmethod
    def format_datetime(dt: datetime, format_str: str = '%Y-%m-%d %H:%M:%S') -> str:
        """Formatar datetime"""
        if dt is None:
            return None
        return dt.strftime(format_str)
    
    @staticmethod
    def format_date(date, format_str: str = '%Y-%m-%d') -> str:
        """Formatar data"""
        if date is None:
            return None
        return date.strftime(format_str)
    
    @staticmethod
    def format_currency(amount: float, currency: str = 'BRL') -> Dict[str, Any]:
        """Formatar valor monetário"""
        if amount is None:
            return None
        
        return {
            'amount': round(amount, 2),
            'currency': currency,
            'formatted': f"R$ {amount:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
        }
    
    @staticmethod
    def format_percentage(value: float, decimals: int = 2) -> str:
        """Formatar porcentagem"""
        if value is None:
            return None
        return f"{round(value, decimals)}%"
    
    @staticmethod
    def format_phone(phone: str) -> str:
        """Formatar telefone brasileiro"""
        if not phone:
            return None
        
        # Remove caracteres não numéricos
        phone_clean = ''.join(filter(str.isdigit, phone))
        
        if len(phone_clean) == 10:
            # Telefone fixo: (XX) XXXX-XXXX
            return f"({phone_clean[:2]}) {phone_clean[2:6]}-{phone_clean[6:]}"
        elif len(phone_clean) == 11:
            # Celular: (XX) XXXXX-XXXX
            return f"({phone_clean[:2]}) {phone_clean[2:7]}-{phone_clean[7:]}"
        else:
            return phone
    
    @staticmethod
    def format_cpf(cpf: str) -> str:
        """Formatar CPF"""
        if not cpf:
            return None
        
        # Remove caracteres não numéricos
        cpf_clean = ''.join(filter(str.isdigit, cpf))
        
        if len(cpf_clean) == 11:
            return f"{cpf_clean[:3]}.{cpf_clean[3:6]}.{cpf_clean[6:9]}-{cpf_clean[9:]}"
        else:
            return cpf
    
    @staticmethod
    def format_cnpj(cnpj: str) -> str:
        """Formatar CNPJ"""
        if not cnpj:
            return None
        
        # Remove caracteres não numéricos
        cnpj_clean = ''.join(filter(str.isdigit, cnpj))
        
        if len(cnpj_clean) == 14:
            return f"{cnpj_clean[:2]}.{cnpj_clean[2:5]}.{cnpj_clean[5:8]}/{cnpj_clean[8:12]}-{cnpj_clean[12:]}"
        else:
            return cnpj
    
    @staticmethod
    def format_cep(cep: str) -> str:
        """Formatar CEP"""
        if not cep:
            return None
        
        # Remove caracteres não numéricos
        cep_clean = ''.join(filter(str.isdigit, cep))
        
        if len(cep_clean) == 8:
            return f"{cep_clean[:5]}-{cep_clean[5:]}"
        else:
            return cep
    
    @staticmethod
    def mask_sensitive_data(data: str, mask_char: str = '*', visible_chars: int = 4) -> str:
        """Mascarar dados sensíveis"""
        if not data or len(data) <= visible_chars:
            return data
        
        visible_part = data[-visible_chars:]
        masked_part = mask_char * (len(data) - visible_chars)
        
        return masked_part + visible_part

class FilterHelper:
    """Helper para filtros de consulta"""
    
    @staticmethod
    def get_date_range() -> tuple:
        """Obter intervalo de datas dos parâmetros da requisição"""
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                start_date = None
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                end_date = None
        
        return start_date, end_date
    
    @staticmethod
    def get_search_term() -> Optional[str]:
        """Obter termo de busca dos parâmetros da requisição"""
        search = request.args.get('search', '').strip()
        return search if search else None
    
    @staticmethod
    def get_status_filter() -> Optional[str]:
        """Obter filtro de status dos parâmetros da requisição"""
        return request.args.get('status')
    
    @staticmethod
    def get_sort_params() -> tuple:
        """Obter parâmetros de ordenação"""
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc').lower()
        
        if sort_order not in ['asc', 'desc']:
            sort_order = 'desc'
        
        return sort_by, sort_order
    
    @staticmethod
    def apply_filters(query, model, filters: Dict[str, Any]):
        """Aplicar filtros à query"""
        for field, value in filters.items():
            if value is not None and hasattr(model, field):
                column = getattr(model, field)
                
                if isinstance(value, str) and value.startswith('%') and value.endswith('%'):
                    # Busca com LIKE
                    query = query.filter(column.ilike(value))
                elif isinstance(value, list):
                    # Filtro IN
                    query = query.filter(column.in_(value))
                else:
                    # Filtro exato
                    query = query.filter(column == value)
        
        return query

class ResponseCache:
    """Cache simples para respostas"""
    
    def __init__(self):
        self._cache = {}
        self._timestamps = {}
    
    def get(self, key: str, max_age: int = 300) -> Optional[Any]:
        """Obter item do cache"""
        if key not in self._cache:
            return None
        
        # Verificar se não expirou
        timestamp = self._timestamps.get(key, 0)
        if datetime.now().timestamp() - timestamp > max_age:
            self.delete(key)
            return None
        
        return self._cache[key]
    
    def set(self, key: str, value: Any) -> None:
        """Definir item no cache"""
        self._cache[key] = value
        self._timestamps[key] = datetime.now().timestamp()
    
    def delete(self, key: str) -> None:
        """Remover item do cache"""
        self._cache.pop(key, None)
        self._timestamps.pop(key, None)
    
    def clear(self) -> None:
        """Limpar todo o cache"""
        self._cache.clear()
        self._timestamps.clear()

class MetricsCollector:
    """Coletor de métricas da API"""
    
    def __init__(self):
        self.metrics = {
            'requests_total': 0,
            'requests_by_endpoint': {},
            'response_times': [],
            'error_count': 0,
            'status_codes': {}
        }
    
    def record_request(self, endpoint: str, method: str, status_code: int, response_time: float):
        """Registrar métrica de requisição"""
        self.metrics['requests_total'] += 1
        
        endpoint_key = f"{method} {endpoint}"
        if endpoint_key not in self.metrics['requests_by_endpoint']:
            self.metrics['requests_by_endpoint'][endpoint_key] = 0
        self.metrics['requests_by_endpoint'][endpoint_key] += 1
        
        self.metrics['response_times'].append(response_time)
        
        if status_code >= 400:
            self.metrics['error_count'] += 1
        
        if status_code not in self.metrics['status_codes']:
            self.metrics['status_codes'][status_code] = 0
        self.metrics['status_codes'][status_code] += 1
    
    def get_metrics(self) -> Dict[str, Any]:
        """Obter métricas coletadas"""
        response_times = self.metrics['response_times']
        
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        return {
            'requests_total': self.metrics['requests_total'],
            'requests_by_endpoint': self.metrics['requests_by_endpoint'],
            'average_response_time': round(avg_response_time, 3),
            'error_count': self.metrics['error_count'],
            'error_rate': round(self.metrics['error_count'] / max(self.metrics['requests_total'], 1) * 100, 2),
            'status_codes': self.metrics['status_codes']
        }
    
    def reset_metrics(self):
        """Resetar métricas"""
        self.metrics = {
            'requests_total': 0,
            'requests_by_endpoint': {},
            'response_times': [],
            'error_count': 0,
            'status_codes': {}
        }

# Instâncias globais
response_cache = ResponseCache()
metrics_collector = MetricsCollector()