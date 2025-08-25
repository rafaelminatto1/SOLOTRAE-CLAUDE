# -*- coding: utf-8 -*-
"""
Utilitários de Validação - FisioFlow Backend

Este módulo contém classes e funções para validação
de dados de entrada, incluindo validadores específicos
para o domínio da fisioterapia.
"""

import re
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, date
from functools import wraps
from flask import request
import phonenumbers
from phonenumbers import NumberParseException

class ValidationError(Exception):
    """Exceção para erros de validação"""
    
    def __init__(self, message: str, field: Optional[str] = None, code: Optional[str] = None):
        self.message = message
        self.field = field
        self.code = code
        super().__init__(message)

class BaseValidator:
    """Classe base para validadores"""
    
    def __init__(self, required: bool = True, allow_none: bool = False):
        self.required = required
        self.allow_none = allow_none
    
    def validate(self, value: Any, field_name: str = None) -> Any:
        """Validar valor"""
        if value is None:
            if self.required and not self.allow_none:
                raise ValidationError(f"Campo {field_name or 'obrigatório'} é obrigatório", field_name, "REQUIRED")
            return None
        
        return self._validate_value(value, field_name)
    
    def _validate_value(self, value: Any, field_name: str = None) -> Any:
        """Implementar validação específica"""
        return value

class StringValidator(BaseValidator):
    """Validador para strings"""
    
    def __init__(self, min_length: int = 0, max_length: int = None, pattern: str = None, **kwargs):
        super().__init__(**kwargs)
        self.min_length = min_length
        self.max_length = max_length
        self.pattern = re.compile(pattern) if pattern else None
    
    def _validate_value(self, value: Any, field_name: str = None) -> str:
        if not isinstance(value, str):
            raise ValidationError(f"Campo {field_name or 'texto'} deve ser uma string", field_name, "INVALID_TYPE")
        
        value = value.strip()
        
        if len(value) < self.min_length:
            raise ValidationError(
                f"Campo {field_name or 'texto'} deve ter pelo menos {self.min_length} caracteres",
                field_name, "MIN_LENGTH"
            )
        
        if self.max_length and len(value) > self.max_length:
            raise ValidationError(
                f"Campo {field_name or 'texto'} deve ter no máximo {self.max_length} caracteres",
                field_name, "MAX_LENGTH"
            )
        
        if self.pattern and not self.pattern.match(value):
            raise ValidationError(
                f"Campo {field_name or 'texto'} tem formato inválido",
                field_name, "INVALID_FORMAT"
            )
        
        return value

class EmailValidator(BaseValidator):
    """Validador para email"""
    
    EMAIL_PATTERN = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    def _validate_value(self, value: Any, field_name: str = None) -> str:
        if not isinstance(value, str):
            raise ValidationError(f"Email deve ser uma string", field_name, "INVALID_TYPE")
        
        value = value.strip().lower()
        
        if not self.EMAIL_PATTERN.match(value):
            raise ValidationError("Email inválido", field_name, "INVALID_EMAIL")
        
        return value

class PhoneValidator(BaseValidator):
    """Validador para telefone brasileiro"""
    
    def _validate_value(self, value: Any, field_name: str = None) -> str:
        if not isinstance(value, str):
            raise ValidationError(f"Telefone deve ser uma string", field_name, "INVALID_TYPE")
        
        # Remove caracteres não numéricos
        phone_clean = ''.join(filter(str.isdigit, value))
        
        # Adiciona código do país se não tiver
        if len(phone_clean) == 10 or len(phone_clean) == 11:
            phone_clean = '+55' + phone_clean
        
        try:
            parsed_phone = phonenumbers.parse(phone_clean, 'BR')
            if not phonenumbers.is_valid_number(parsed_phone):
                raise ValidationError("Telefone inválido", field_name, "INVALID_PHONE")
            
            return phonenumbers.format_number(parsed_phone, phonenumbers.PhoneNumberFormat.E164)
        except NumberParseException:
            raise ValidationError("Telefone inválido", field_name, "INVALID_PHONE")

class CPFValidator(BaseValidator):
    """Validador para CPF"""
    
    def _validate_value(self, value: Any, field_name: str = None) -> str:
        if not isinstance(value, str):
            raise ValidationError(f"CPF deve ser uma string", field_name, "INVALID_TYPE")
        
        # Remove caracteres não numéricos
        cpf = ''.join(filter(str.isdigit, value))
        
        if len(cpf) != 11:
            raise ValidationError("CPF deve ter 11 dígitos", field_name, "INVALID_CPF")
        
        # Verifica se todos os dígitos são iguais
        if cpf == cpf[0] * 11:
            raise ValidationError("CPF inválido", field_name, "INVALID_CPF")
        
        # Validação dos dígitos verificadores
        def calculate_digit(cpf_digits, weights):
            total = sum(int(digit) * weight for digit, weight in zip(cpf_digits, weights))
            remainder = total % 11
            return 0 if remainder < 2 else 11 - remainder
        
        # Primeiro dígito verificador
        first_digit = calculate_digit(cpf[:9], range(10, 1, -1))
        if int(cpf[9]) != first_digit:
            raise ValidationError("CPF inválido", field_name, "INVALID_CPF")
        
        # Segundo dígito verificador
        second_digit = calculate_digit(cpf[:10], range(11, 1, -1))
        if int(cpf[10]) != second_digit:
            raise ValidationError("CPF inválido", field_name, "INVALID_CPF")
        
        return cpf

class CNPJValidator(BaseValidator):
    """Validador para CNPJ"""
    
    def _validate_value(self, value: Any, field_name: str = None) -> str:
        if not isinstance(value, str):
            raise ValidationError(f"CNPJ deve ser uma string", field_name, "INVALID_TYPE")
        
        # Remove caracteres não numéricos
        cnpj = ''.join(filter(str.isdigit, value))
        
        if len(cnpj) != 14:
            raise ValidationError("CNPJ deve ter 14 dígitos", field_name, "INVALID_CNPJ")
        
        # Verifica se todos os dígitos são iguais
        if cnpj == cnpj[0] * 14:
            raise ValidationError("CNPJ inválido", field_name, "INVALID_CNPJ")
        
        # Validação dos dígitos verificadores
        def calculate_digit(cnpj_digits, weights):
            total = sum(int(digit) * weight for digit, weight in zip(cnpj_digits, weights))
            remainder = total % 11
            return 0 if remainder < 2 else 11 - remainder
        
        # Primeiro dígito verificador
        weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        first_digit = calculate_digit(cnpj[:12], weights1)
        if int(cnpj[12]) != first_digit:
            raise ValidationError("CNPJ inválido", field_name, "INVALID_CNPJ")
        
        # Segundo dígito verificador
        weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        second_digit = calculate_digit(cnpj[:13], weights2)
        if int(cnpj[13]) != second_digit:
            raise ValidationError("CNPJ inválido", field_name, "INVALID_CNPJ")
        
        return cnpj

class CREFITOValidator(BaseValidator):
    """Validador para CREFITO"""
    
    CREFITO_PATTERN = re.compile(r'^\d{1,6}-F$')
    
    def _validate_value(self, value: Any, field_name: str = None) -> str:
        if not isinstance(value, str):
            raise ValidationError(f"CREFITO deve ser uma string", field_name, "INVALID_TYPE")
        
        value = value.strip().upper()
        
        if not self.CREFITO_PATTERN.match(value):
            raise ValidationError(
                "CREFITO deve ter o formato XXXXXX-F (ex: 123456-F)",
                field_name, "INVALID_CREFITO"
            )
        
        return value

class DateValidator(BaseValidator):
    """Validador para datas"""
    
    def __init__(self, min_date: date = None, max_date: date = None, **kwargs):
        super().__init__(**kwargs)
        self.min_date = min_date
        self.max_date = max_date
    
    def _validate_value(self, value: Any, field_name: str = None) -> date:
        if isinstance(value, str):
            try:
                value = datetime.strptime(value, '%Y-%m-%d').date()
            except ValueError:
                raise ValidationError(
                    f"Data deve estar no formato YYYY-MM-DD",
                    field_name, "INVALID_DATE_FORMAT"
                )
        elif isinstance(value, datetime):
            value = value.date()
        elif not isinstance(value, date):
            raise ValidationError(f"Data inválida", field_name, "INVALID_TYPE")
        
        if self.min_date and value < self.min_date:
            raise ValidationError(
                f"Data deve ser posterior a {self.min_date}",
                field_name, "DATE_TOO_EARLY"
            )
        
        if self.max_date and value > self.max_date:
            raise ValidationError(
                f"Data deve ser anterior a {self.max_date}",
                field_name, "DATE_TOO_LATE"
            )
        
        return value

class DateTimeValidator(BaseValidator):
    """Validador para datetime"""
    
    def __init__(self, min_datetime: datetime = None, max_datetime: datetime = None, **kwargs):
        super().__init__(**kwargs)
        self.min_datetime = min_datetime
        self.max_datetime = max_datetime
    
    def _validate_value(self, value: Any, field_name: str = None) -> datetime:
        if isinstance(value, str):
            try:
                # Tenta diferentes formatos
                for fmt in ['%Y-%m-%d %H:%M:%S', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M']:
                    try:
                        value = datetime.strptime(value, fmt)
                        break
                    except ValueError:
                        continue
                else:
                    raise ValueError("Formato não reconhecido")
            except ValueError:
                raise ValidationError(
                    f"DateTime deve estar no formato YYYY-MM-DD HH:MM:SS",
                    field_name, "INVALID_DATETIME_FORMAT"
                )
        elif not isinstance(value, datetime):
            raise ValidationError(f"DateTime inválido", field_name, "INVALID_TYPE")
        
        if self.min_datetime and value < self.min_datetime:
            raise ValidationError(
                f"DateTime deve ser posterior a {self.min_datetime}",
                field_name, "DATETIME_TOO_EARLY"
            )
        
        if self.max_datetime and value > self.max_datetime:
            raise ValidationError(
                f"DateTime deve ser anterior a {self.max_datetime}",
                field_name, "DATETIME_TOO_LATE"
            )
        
        return value

class NumberValidator(BaseValidator):
    """Validador para números"""
    
    def __init__(self, min_value: Union[int, float] = None, max_value: Union[int, float] = None, **kwargs):
        super().__init__(**kwargs)
        self.min_value = min_value
        self.max_value = max_value
    
    def _validate_value(self, value: Any, field_name: str = None) -> Union[int, float]:
        if isinstance(value, str):
            try:
                value = float(value) if '.' in value else int(value)
            except ValueError:
                raise ValidationError(f"Valor deve ser um número", field_name, "INVALID_NUMBER")
        elif not isinstance(value, (int, float)):
            raise ValidationError(f"Valor deve ser um número", field_name, "INVALID_TYPE")
        
        if self.min_value is not None and value < self.min_value:
            raise ValidationError(
                f"Valor deve ser maior ou igual a {self.min_value}",
                field_name, "VALUE_TOO_LOW"
            )
        
        if self.max_value is not None and value > self.max_value:
            raise ValidationError(
                f"Valor deve ser menor ou igual a {self.max_value}",
                field_name, "VALUE_TOO_HIGH"
            )
        
        return value

class ChoiceValidator(BaseValidator):
    """Validador para escolhas"""
    
    def __init__(self, choices: List[Any], **kwargs):
        super().__init__(**kwargs)
        self.choices = choices
    
    def _validate_value(self, value: Any, field_name: str = None) -> Any:
        if value not in self.choices:
            raise ValidationError(
                f"Valor deve ser um dos seguintes: {', '.join(map(str, self.choices))}",
                field_name, "INVALID_CHOICE"
            )
        
        return value

class ListValidator(BaseValidator):
    """Validador para listas"""
    
    def __init__(self, item_validator: BaseValidator = None, min_items: int = 0, max_items: int = None, **kwargs):
        super().__init__(**kwargs)
        self.item_validator = item_validator
        self.min_items = min_items
        self.max_items = max_items
    
    def _validate_value(self, value: Any, field_name: str = None) -> List[Any]:
        if not isinstance(value, list):
            raise ValidationError(f"Valor deve ser uma lista", field_name, "INVALID_TYPE")
        
        if len(value) < self.min_items:
            raise ValidationError(
                f"Lista deve ter pelo menos {self.min_items} itens",
                field_name, "MIN_ITEMS"
            )
        
        if self.max_items is not None and len(value) > self.max_items:
            raise ValidationError(
                f"Lista deve ter no máximo {self.max_items} itens",
                field_name, "MAX_ITEMS"
            )
        
        if self.item_validator:
            validated_items = []
            for i, item in enumerate(value):
                try:
                    validated_item = self.item_validator.validate(item, f"{field_name}[{i}]")
                    validated_items.append(validated_item)
                except ValidationError as e:
                    raise ValidationError(
                        f"Item {i} da lista: {e.message}",
                        field_name, e.code
                    )
            return validated_items
        
        return value

class DictValidator(BaseValidator):
    """Validador para dicionários"""
    
    def __init__(self, schema: Dict[str, BaseValidator], strict: bool = True, **kwargs):
        super().__init__(**kwargs)
        self.schema = schema
        self.strict = strict
    
    def _validate_value(self, value: Any, field_name: str = None) -> Dict[str, Any]:
        if not isinstance(value, dict):
            raise ValidationError(f"Valor deve ser um objeto", field_name, "INVALID_TYPE")
        
        validated_data = {}
        errors = {}
        
        # Validar campos do schema
        for field, validator in self.schema.items():
            try:
                field_value = value.get(field)
                validated_data[field] = validator.validate(field_value, field)
            except ValidationError as e:
                errors[field] = e.message
        
        # Verificar campos extras se strict mode
        if self.strict:
            extra_fields = set(value.keys()) - set(self.schema.keys())
            if extra_fields:
                for field in extra_fields:
                    errors[field] = "Campo não permitido"
        else:
            # Adicionar campos extras sem validação
            for field, field_value in value.items():
                if field not in self.schema:
                    validated_data[field] = field_value
        
        if errors:
            raise ValidationError("Dados inválidos", field_name, "VALIDATION_ERRORS")
        
        return validated_data

class PasswordValidator(BaseValidator):
    """Validador para senhas"""
    
    def __init__(self, min_length: int = 8, require_uppercase: bool = True, 
                 require_lowercase: bool = True, require_digits: bool = True, 
                 require_special: bool = True, **kwargs):
        super().__init__(**kwargs)
        self.min_length = min_length
        self.require_uppercase = require_uppercase
        self.require_lowercase = require_lowercase
        self.require_digits = require_digits
        self.require_special = require_special
    
    def _validate_value(self, value: Any, field_name: str = None) -> str:
        if not isinstance(value, str):
            raise ValidationError(f"Senha deve ser uma string", field_name, "INVALID_TYPE")
        
        if len(value) < self.min_length:
            raise ValidationError(
                f"Senha deve ter pelo menos {self.min_length} caracteres",
                field_name, "PASSWORD_TOO_SHORT"
            )
        
        if self.require_uppercase and not re.search(r'[A-Z]', value):
            raise ValidationError(
                "Senha deve conter pelo menos uma letra maiúscula",
                field_name, "PASSWORD_NO_UPPERCASE"
            )
        
        if self.require_lowercase and not re.search(r'[a-z]', value):
            raise ValidationError(
                "Senha deve conter pelo menos uma letra minúscula",
                field_name, "PASSWORD_NO_LOWERCASE"
            )
        
        if self.require_digits and not re.search(r'\d', value):
            raise ValidationError(
                "Senha deve conter pelo menos um dígito",
                field_name, "PASSWORD_NO_DIGITS"
            )
        
        if self.require_special and not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValidationError(
                "Senha deve conter pelo menos um caractere especial",
                field_name, "PASSWORD_NO_SPECIAL"
            )
        
        return value

class DataValidator:
    """Validador principal para dados"""
    
    def __init__(self, schema: Dict[str, BaseValidator]):
        self.schema = schema
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validar dados completos"""
        if not isinstance(data, dict):
            raise ValidationError("Dados devem ser um objeto", code="INVALID_TYPE")
        
        validated_data = {}
        errors = {}
        
        for field, validator in self.schema.items():
            try:
                field_value = data.get(field)
                validated_data[field] = validator.validate(field_value, field)
            except ValidationError as e:
                errors[field] = {
                    'message': e.message,
                    'code': e.code
                }
        
        if errors:
            raise ValidationError("Dados inválidos", code="VALIDATION_ERRORS")
        
        return validated_data

def validate_request_data(schema: Dict[str, BaseValidator]):
    """Decorator para validar dados da requisição"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                data = request.get_json() or {}
                validator = DataValidator(schema)
                validated_data = validator.validate(data)
                
                # Adicionar dados validados ao request
                request.validated_data = validated_data
                
                return func(*args, **kwargs)
            except ValidationError as e:
                from .response import APIResponse
                if e.code == "VALIDATION_ERRORS":
                    return APIResponse.validation_error(errors)
                else:
                    return APIResponse.validation_error(e.message)
        
        return wrapper
    return decorator

# Validadores pré-configurados comuns
user_registration_schema = {
    'name': StringValidator(min_length=2, max_length=100),
    'email': EmailValidator(),
    'password': PasswordValidator(),
    'phone': PhoneValidator(required=False),
    'cpf': CPFValidator(required=False),
    'birth_date': DateValidator(required=False, max_date=date.today()),
    'role': ChoiceValidator(['ADMIN', 'FISIOTERAPEUTA', 'ESTAGIARIO', 'PACIENTE', 'PARCEIRO'])
}

patient_schema = {
    'name': StringValidator(min_length=2, max_length=100),
    'email': EmailValidator(required=False),
    'phone': PhoneValidator(),
    'cpf': CPFValidator(),
    'birth_date': DateValidator(max_date=date.today()),
    'gender': ChoiceValidator(['M', 'F', 'O']),
    'address': StringValidator(max_length=200, required=False),
    'emergency_contact': StringValidator(max_length=100, required=False),
    'emergency_phone': PhoneValidator(required=False)
}

appointment_schema = {
    'patient_id': NumberValidator(min_value=1),
    'professional_id': NumberValidator(min_value=1),
    'appointment_date': DateTimeValidator(min_datetime=datetime.now()),
    'duration': NumberValidator(min_value=15, max_value=240),
    'notes': StringValidator(max_length=500, required=False),
    'type': ChoiceValidator(['CONSULTA', 'RETORNO', 'AVALIACAO', 'TELECONSULTA'])
}

exercise_schema = {
    'name': StringValidator(min_length=2, max_length=100),
    'description': StringValidator(max_length=1000),
    'category': ChoiceValidator(['CERVICAL', 'MEMBROS_SUPERIORES', 'TRONCO', 'MEMBROS_INFERIORES', 'MOBILIZACAO_NEURAL', 'MOBILIDADE_GERAL']),
    'difficulty': ChoiceValidator(['FACIL', 'MEDIO', 'DIFICIL']),
    'duration': NumberValidator(min_value=1, max_value=60),
    'repetitions': NumberValidator(min_value=1, max_value=100, required=False),
    'sets': NumberValidator(min_value=1, max_value=10, required=False)
}