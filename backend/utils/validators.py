# -*- coding: utf-8 -*-
"""
Validadores - FisioFlow Backend

Este módulo fornece validadores personalizados para dados específicos
do sistema de fisioterapia, incluindo validações de CPF, CREFITO,
e-mail, telefone, CEP e outros dados médicos.

Recursos:
- Validação de documentos brasileiros
- Validação de dados médicos
- Validação de contatos
- Validação de endereços
- Validação de dados de agendamento
"""

import re
import requests
from datetime import datetime, date, time
from typing import Dict, Any, Optional, List, Union
from email_validator import validate_email, EmailNotValidError

class DocumentValidator:
    """
    Validador de documentos brasileiros
    """
    
    @staticmethod
    def validate_cpf(cpf: str) -> Dict[str, Any]:
        """
        Valida CPF brasileiro
        
        Args:
            cpf: CPF para validar
            
        Returns:
            Dicionário com resultado da validação
        """
        result = {
            'valid': False,
            'formatted': None,
            'error': None
        }
        
        if not cpf:
            result['error'] = 'CPF é obrigatório'
            return result
        
        # Remover caracteres não numéricos
        cpf_numbers = re.sub(r'\D', '', cpf)
        
        # Verificar se tem 11 dígitos
        if len(cpf_numbers) != 11:
            result['error'] = 'CPF deve ter 11 dígitos'
            return result
        
        # Verificar se todos os dígitos são iguais
        if cpf_numbers == cpf_numbers[0] * 11:
            result['error'] = 'CPF inválido'
            return result
        
        # Calcular primeiro dígito verificador
        sum1 = sum(int(cpf_numbers[i]) * (10 - i) for i in range(9))
        digit1 = 11 - (sum1 % 11)
        if digit1 >= 10:
            digit1 = 0
        
        # Calcular segundo dígito verificador
        sum2 = sum(int(cpf_numbers[i]) * (11 - i) for i in range(10))
        digit2 = 11 - (sum2 % 11)
        if digit2 >= 10:
            digit2 = 0
        
        # Verificar dígitos verificadores
        if int(cpf_numbers[9]) != digit1 or int(cpf_numbers[10]) != digit2:
            result['error'] = 'CPF inválido'
            return result
        
        # CPF válido
        result['valid'] = True
        result['formatted'] = f"{cpf_numbers[:3]}.{cpf_numbers[3:6]}.{cpf_numbers[6:9]}-{cpf_numbers[9:]}"
        
        return result
    
    @staticmethod
    def validate_cnpj(cnpj: str) -> Dict[str, Any]:
        """
        Valida CNPJ brasileiro
        
        Args:
            cnpj: CNPJ para validar
            
        Returns:
            Dicionário com resultado da validação
        """
        result = {
            'valid': False,
            'formatted': None,
            'error': None
        }
        
        if not cnpj:
            result['error'] = 'CNPJ é obrigatório'
            return result
        
        # Remover caracteres não numéricos
        cnpj_numbers = re.sub(r'\D', '', cnpj)
        
        # Verificar se tem 14 dígitos
        if len(cnpj_numbers) != 14:
            result['error'] = 'CNPJ deve ter 14 dígitos'
            return result
        
        # Verificar se todos os dígitos são iguais
        if cnpj_numbers == cnpj_numbers[0] * 14:
            result['error'] = 'CNPJ inválido'
            return result
        
        # Calcular primeiro dígito verificador
        weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        sum1 = sum(int(cnpj_numbers[i]) * weights1[i] for i in range(12))
        digit1 = 11 - (sum1 % 11)
        if digit1 >= 10:
            digit1 = 0
        
        # Calcular segundo dígito verificador
        weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        sum2 = sum(int(cnpj_numbers[i]) * weights2[i] for i in range(13))
        digit2 = 11 - (sum2 % 11)
        if digit2 >= 10:
            digit2 = 0
        
        # Verificar dígitos verificadores
        if int(cnpj_numbers[12]) != digit1 or int(cnpj_numbers[13]) != digit2:
            result['error'] = 'CNPJ inválido'
            return result
        
        # CNPJ válido
        result['valid'] = True
        result['formatted'] = f"{cnpj_numbers[:2]}.{cnpj_numbers[2:5]}.{cnpj_numbers[5:8]}/{cnpj_numbers[8:12]}-{cnpj_numbers[12:]}"
        
        return result
    
    @staticmethod
    def validate_crefito(crefito: str, region: str = None) -> Dict[str, Any]:
        """
        Valida número CREFITO
        
        Args:
            crefito: Número CREFITO
            region: Região do CREFITO (opcional)
            
        Returns:
            Dicionário com resultado da validação
        """
        result = {
            'valid': False,
            'formatted': None,
            'region': None,
            'error': None
        }
        
        if not crefito:
            result['error'] = 'CREFITO é obrigatório'
            return result
        
        # Remover caracteres não numéricos e converter para maiúsculo
        crefito_clean = re.sub(r'[^0-9A-Z]', '', crefito.upper())
        
        # Padrão: CREFITO + região + número
        # Ex: CREFITO3/123456-F ou 123456-F (se região fornecida)
        pattern = r'^(?:CREFITO)?(\d{1,2})/(\d{4,6})-?([A-Z]?)$'
        match = re.match(pattern, crefito_clean)
        
        if not match:
            # Tentar padrão simplificado se região fornecida
            if region:
                simple_pattern = r'^(\d{4,6})-?([A-Z]?)$'
                simple_match = re.match(simple_pattern, crefito_clean)
                if simple_match:
                    number, suffix = simple_match.groups()
                    result['valid'] = True
                    result['formatted'] = f"CREFITO{region}/{number}{'-' + suffix if suffix else ''}"
                    result['region'] = region
                    return result
            
            result['error'] = 'Formato de CREFITO inválido'
            return result
        
        region_num, number, suffix = match.groups()
        
        # Validar região (1-19)
        if not (1 <= int(region_num) <= 19):
            result['error'] = 'Região do CREFITO inválida'
            return result
        
        # Validar número
        if len(number) < 4:
            result['error'] = 'Número do CREFITO muito curto'
            return result
        
        result['valid'] = True
        result['formatted'] = f"CREFITO{region_num}/{number}{'-' + suffix if suffix else ''}"
        result['region'] = region_num
        
        return result

class ContactValidator:
    """
    Validador de dados de contato
    """
    
    @staticmethod
    def validate_email(email: str) -> Dict[str, Any]:
        """
        Valida endereço de e-mail
        
        Args:
            email: E-mail para validar
            
        Returns:
            Dicionário com resultado da validação
        """
        result = {
            'valid': False,
            'normalized': None,
            'error': None
        }
        
        if not email:
            result['error'] = 'E-mail é obrigatório'
            return result
        
        try:
            # Validar e normalizar e-mail
            validated_email = validate_email(email)
            result['valid'] = True
            result['normalized'] = validated_email.email
            
        except EmailNotValidError as e:
            result['error'] = str(e)
        
        return result
    
    @staticmethod
    def validate_phone(phone: str) -> Dict[str, Any]:
        """
        Valida número de telefone brasileiro
        
        Args:
            phone: Telefone para validar
            
        Returns:
            Dicionário com resultado da validação
        """
        result = {
            'valid': False,
            'formatted': None,
            'type': None,
            'error': None
        }
        
        if not phone:
            result['error'] = 'Telefone é obrigatório'
            return result
        
        # Remover caracteres não numéricos
        phone_numbers = re.sub(r'\D', '', phone)
        
        # Verificar comprimento
        if len(phone_numbers) < 10 or len(phone_numbers) > 11:
            result['error'] = 'Telefone deve ter 10 ou 11 dígitos'
            return result
        
        # Verificar se começa com código de área válido
        area_code = phone_numbers[:2]
        valid_area_codes = [
            '11', '12', '13', '14', '15', '16', '17', '18', '19',  # SP
            '21', '22', '24',  # RJ
            '27', '28',  # ES
            '31', '32', '33', '34', '35', '37', '38',  # MG
            '41', '42', '43', '44', '45', '46',  # PR
            '47', '48', '49',  # SC
            '51', '53', '54', '55',  # RS
            '61',  # DF
            '62', '64',  # GO
            '63',  # TO
            '65', '66',  # MT
            '67',  # MS
            '68',  # AC
            '69',  # RO
            '71', '73', '74', '75', '77',  # BA
            '79',  # SE
            '81', '87',  # PE
            '82',  # AL
            '83',  # PB
            '84',  # RN
            '85', '88',  # CE
            '86', '89',  # PI
            '91', '93', '94',  # PA
            '92', '97',  # AM
            '95',  # RR
            '96',  # AP
            '98', '99'   # MA
        ]
        
        if area_code not in valid_area_codes:
            result['error'] = 'Código de área inválido'
            return result
        
        # Determinar tipo e formatar
        if len(phone_numbers) == 10:
            # Telefone fixo
            result['type'] = 'fixo'
            result['formatted'] = f"({phone_numbers[:2]}) {phone_numbers[2:6]}-{phone_numbers[6:]}"
        else:
            # Celular
            first_digit = phone_numbers[2]
            if first_digit not in ['9', '8', '7', '6']:
                result['error'] = 'Primeiro dígito do celular inválido'
                return result
            
            result['type'] = 'celular'
            result['formatted'] = f"({phone_numbers[:2]}) {phone_numbers[2:7]}-{phone_numbers[7:]}"
        
        result['valid'] = True
        return result

class AddressValidator:
    """
    Validador de endereços
    """
    
    @staticmethod
    def validate_cep(cep: str) -> Dict[str, Any]:
        """
        Valida CEP brasileiro
        
        Args:
            cep: CEP para validar
            
        Returns:
            Dicionário com resultado da validação
        """
        result = {
            'valid': False,
            'formatted': None,
            'error': None
        }
        
        if not cep:
            result['error'] = 'CEP é obrigatório'
            return result
        
        # Remover caracteres não numéricos
        cep_numbers = re.sub(r'\D', '', cep)
        
        # Verificar se tem 8 dígitos
        if len(cep_numbers) != 8:
            result['error'] = 'CEP deve ter 8 dígitos'
            return result
        
        # Verificar se não é sequência inválida
        if cep_numbers == '00000000' or cep_numbers == cep_numbers[0] * 8:
            result['error'] = 'CEP inválido'
            return result
        
        result['valid'] = True
        result['formatted'] = f"{cep_numbers[:5]}-{cep_numbers[5:]}"
        
        return result
    
    @staticmethod
    def lookup_cep(cep: str) -> Dict[str, Any]:
        """
        Consulta dados do CEP via API
        
        Args:
            cep: CEP para consultar
            
        Returns:
            Dicionário com dados do endereço
        """
        result = {
            'found': False,
            'data': None,
            'error': None
        }
        
        # Validar CEP primeiro
        validation = AddressValidator.validate_cep(cep)
        if not validation['valid']:
            result['error'] = validation['error']
            return result
        
        cep_clean = re.sub(r'\D', '', cep)
        
        try:
            # Consultar ViaCEP
            response = requests.get(
                f"https://viacep.com.br/ws/{cep_clean}/json/",
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if 'erro' not in data:
                    result['found'] = True
                    result['data'] = {
                        'cep': data.get('cep', ''),
                        'logradouro': data.get('logradouro', ''),
                        'complemento': data.get('complemento', ''),
                        'bairro': data.get('bairro', ''),
                        'localidade': data.get('localidade', ''),
                        'uf': data.get('uf', ''),
                        'ibge': data.get('ibge', ''),
                        'gia': data.get('gia', ''),
                        'ddd': data.get('ddd', ''),
                        'siafi': data.get('siafi', '')
                    }
                else:
                    result['error'] = 'CEP não encontrado'
            else:
                result['error'] = 'Erro na consulta do CEP'
                
        except requests.RequestException:
            result['error'] = 'Serviço de CEP indisponível'
        except Exception as e:
            result['error'] = f'Erro inesperado: {str(e)}'
        
        return result

class MedicalValidator:
    """
    Validador de dados médicos
    """
    
    @staticmethod
    def validate_blood_pressure(systolic: int, diastolic: int) -> Dict[str, Any]:
        """
        Valida pressão arterial
        
        Args:
            systolic: Pressão sistólica
            diastolic: Pressão diastólica
            
        Returns:
            Dicionário com resultado da validação
        """
        result = {
            'valid': False,
            'classification': None,
            'error': None
        }
        
        # Validar valores
        if not (50 <= systolic <= 300):
            result['error'] = 'Pressão sistólica deve estar entre 50 e 300 mmHg'
            return result
        
        if not (30 <= diastolic <= 200):
            result['error'] = 'Pressão diastólica deve estar entre 30 e 200 mmHg'
            return result
        
        if systolic <= diastolic:
            result['error'] = 'Pressão sistólica deve ser maior que a diastólica'
            return result
        
        # Classificar pressão arterial
        if systolic < 120 and diastolic < 80:
            classification = 'Normal'
        elif systolic < 130 and diastolic < 80:
            classification = 'Elevada'
        elif systolic < 140 or diastolic < 90:
            classification = 'Hipertensão Estágio 1'
        elif systolic < 180 or diastolic < 120:
            classification = 'Hipertensão Estágio 2'
        else:
            classification = 'Crise Hipertensiva'
        
        result['valid'] = True
        result['classification'] = classification
        
        return result
    
    @staticmethod
    def validate_heart_rate(heart_rate: int, age: int = None) -> Dict[str, Any]:
        """
        Valida frequência cardíaca
        
        Args:
            heart_rate: Frequência cardíaca em BPM
            age: Idade do paciente (opcional)
            
        Returns:
            Dicionário com resultado da validação
        """
        result = {
            'valid': False,
            'classification': None,
            'target_zone': None,
            'error': None
        }
        
        # Validar valor
        if not (30 <= heart_rate <= 250):
            result['error'] = 'Frequência cardíaca deve estar entre 30 e 250 BPM'
            return result
        
        # Classificar FC
        if heart_rate < 60:
            classification = 'Bradicardia'
        elif heart_rate <= 100:
            classification = 'Normal'
        elif heart_rate <= 150:
            classification = 'Taquicardia Leve'
        else:
            classification = 'Taquicardia'
        
        result['valid'] = True
        result['classification'] = classification
        
        # Calcular zona alvo se idade fornecida
        if age and 10 <= age <= 100:
            max_hr = 220 - age
            target_min = int(max_hr * 0.5)
            target_max = int(max_hr * 0.85)
            result['target_zone'] = f"{target_min}-{target_max} BPM"
        
        return result

class ScheduleValidator:
    """
    Validador de dados de agendamento
    """
    
    @staticmethod
    def validate_appointment_time(appointment_date: date, 
                                appointment_time: time) -> Dict[str, Any]:
        """
        Valida data e hora de agendamento
        
        Args:
            appointment_date: Data do agendamento
            appointment_time: Hora do agendamento
            
        Returns:
            Dicionário com resultado da validação
        """
        result = {
            'valid': False,
            'error': None
        }
        
        # Combinar data e hora
        appointment_datetime = datetime.combine(appointment_date, appointment_time)
        now = datetime.now()
        
        # Verificar se não é no passado
        if appointment_datetime <= now:
            result['error'] = 'Agendamento não pode ser no passado'
            return result
        
        # Verificar se não é muito no futuro (1 ano)
        max_future = now.replace(year=now.year + 1)
        if appointment_datetime > max_future:
            result['error'] = 'Agendamento não pode ser mais de 1 ano no futuro'
            return result
        
        # Verificar horário comercial (8h às 18h)
        if not (8 <= appointment_time.hour < 18):
            result['error'] = 'Agendamento deve ser entre 8h e 18h'
            return result
        
        # Verificar se não é domingo
        if appointment_date.weekday() == 6:
            result['error'] = 'Agendamentos não são permitidos aos domingos'
            return result
        
        result['valid'] = True
        return result
    
    @staticmethod
    def validate_duration(duration_minutes: int) -> Dict[str, Any]:
        """
        Valida duração do agendamento
        
        Args:
            duration_minutes: Duração em minutos
            
        Returns:
            Dicionário com resultado da validação
        """
        result = {
            'valid': False,
            'error': None
        }
        
        # Verificar duração mínima e máxima
        if duration_minutes < 15:
            result['error'] = 'Duração mínima é de 15 minutos'
            return result
        
        if duration_minutes > 180:
            result['error'] = 'Duração máxima é de 3 horas'
            return result
        
        # Verificar se é múltiplo de 15 minutos
        if duration_minutes % 15 != 0:
            result['error'] = 'Duração deve ser múltiplo de 15 minutos'
            return result
        
        result['valid'] = True
        return result

class DataValidator:
    """
    Validador genérico de dados
    """
    
    @staticmethod
    def validate_required_fields(data: Dict[str, Any], 
                               required_fields: List[str]) -> Dict[str, Any]:
        """
        Valida campos obrigatórios
        
        Args:
            data: Dados para validar
            required_fields: Lista de campos obrigatórios
            
        Returns:
            Dicionário com resultado da validação
        """
        result = {
            'valid': True,
            'missing_fields': [],
            'error': None
        }
        
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                result['missing_fields'].append(field)
                result['valid'] = False
        
        if not result['valid']:
            result['error'] = f"Campos obrigatórios ausentes: {', '.join(result['missing_fields'])}"
        
        return result
    
    @staticmethod
    def validate_string_length(value: str, min_length: int = 0, 
                             max_length: int = None) -> Dict[str, Any]:
        """
        Valida comprimento de string
        
        Args:
            value: Valor para validar
            min_length: Comprimento mínimo
            max_length: Comprimento máximo
            
        Returns:
            Dicionário com resultado da validação
        """
        result = {
            'valid': False,
            'error': None
        }
        
        if not isinstance(value, str):
            result['error'] = 'Valor deve ser uma string'
            return result
        
        length = len(value)
        
        if length < min_length:
            result['error'] = f'Valor deve ter pelo menos {min_length} caracteres'
            return result
        
        if max_length and length > max_length:
            result['error'] = f'Valor deve ter no máximo {max_length} caracteres'
            return result
        
        result['valid'] = True
        return result
    
    @staticmethod
    def validate_numeric_range(value: Union[int, float], 
                             min_value: Union[int, float] = None,
                             max_value: Union[int, float] = None) -> Dict[str, Any]:
        """
        Valida faixa numérica
        
        Args:
            value: Valor para validar
            min_value: Valor mínimo
            max_value: Valor máximo
            
        Returns:
            Dicionário com resultado da validação
        """
        result = {
            'valid': False,
            'error': None
        }
        
        if not isinstance(value, (int, float)):
            result['error'] = 'Valor deve ser numérico'
            return result
        
        if min_value is not None and value < min_value:
            result['error'] = f'Valor deve ser maior ou igual a {min_value}'
            return result
        
        if max_value is not None and value > max_value:
            result['error'] = f'Valor deve ser menor ou igual a {max_value}'
            return result
        
        result['valid'] = True
        return result