# -*- coding: utf-8 -*-
"""
Utilitários Auxiliares - FisioFlow Backend

Este módulo contém funções auxiliares e utilitários
gerais para o sistema FisioFlow.
"""

import os
import uuid
import hashlib
import secrets
import string
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, date, timedelta
from decimal import Decimal
import json
import base64
from urllib.parse import quote, unquote
import mimetypes
from PIL import Image
import io

def generate_uuid() -> str:
    """Gerar UUID único"""
    return str(uuid.uuid4())

def generate_short_id(length: int = 8) -> str:
    """Gerar ID curto alfanumérico"""
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_voucher_code(prefix: str = 'VCH', length: int = 8) -> str:
    """Gerar código de voucher"""
    code = generate_short_id(length)
    return f"{prefix}-{code}"

def generate_secure_token(length: int = 32) -> str:
    """Gerar token seguro"""
    return secrets.token_urlsafe(length)

def generate_hash(data: str, algorithm: str = 'sha256') -> str:
    """Gerar hash de dados"""
    hash_obj = hashlib.new(algorithm)
    hash_obj.update(data.encode('utf-8'))
    return hash_obj.hexdigest()

def generate_file_hash(file_path: str) -> str:
    """Gerar hash de arquivo"""
    hash_obj = hashlib.sha256()
    
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_obj.update(chunk)
    
    return hash_obj.hexdigest()

def sanitize_filename(filename: str) -> str:
    """Sanitizar nome de arquivo"""
    # Remove caracteres perigosos
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    
    # Remove espaços extras e pontos no início/fim
    filename = filename.strip(' .')
    
    # Limita o tamanho
    if len(filename) > 255:
        name, ext = os.path.splitext(filename)
        filename = name[:255-len(ext)] + ext
    
    return filename

def get_file_extension(filename: str) -> str:
    """Obter extensão do arquivo"""
    return os.path.splitext(filename)[1].lower()

def get_mime_type(filename: str) -> str:
    """Obter tipo MIME do arquivo"""
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type or 'application/octet-stream'

def is_image_file(filename: str) -> bool:
    """Verificar se é arquivo de imagem"""
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'}
    return get_file_extension(filename) in image_extensions

def is_video_file(filename: str) -> bool:
    """Verificar se é arquivo de vídeo"""
    video_extensions = {'.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'}
    return get_file_extension(filename) in video_extensions

def is_document_file(filename: str) -> bool:
    """Verificar se é arquivo de documento"""
    doc_extensions = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'}
    return get_file_extension(filename) in doc_extensions

def format_file_size(size_bytes: int) -> str:
    """Formatar tamanho de arquivo"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"

def resize_image(image_data: bytes, max_width: int = 800, max_height: int = 600, quality: int = 85) -> bytes:
    """Redimensionar imagem"""
    try:
        image = Image.open(io.BytesIO(image_data))
        
        # Converter para RGB se necessário
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Calcular novo tamanho mantendo proporção
        width, height = image.size
        ratio = min(max_width / width, max_height / height)
        
        if ratio < 1:
            new_width = int(width * ratio)
            new_height = int(height * ratio)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Salvar imagem redimensionada
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=quality, optimize=True)
        
        return output.getvalue()
    except Exception:
        return image_data  # Retorna original se falhar

def create_thumbnail(image_data: bytes, size: tuple = (150, 150)) -> bytes:
    """Criar thumbnail de imagem"""
    try:
        image = Image.open(io.BytesIO(image_data))
        
        # Converter para RGB se necessário
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Criar thumbnail
        image.thumbnail(size, Image.Resampling.LANCZOS)
        
        # Salvar thumbnail
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=80, optimize=True)
        
        return output.getvalue()
    except Exception:
        return image_data  # Retorna original se falhar

def encode_base64(data: Union[str, bytes]) -> str:
    """Codificar em base64"""
    if isinstance(data, str):
        data = data.encode('utf-8')
    return base64.b64encode(data).decode('utf-8')

def decode_base64(data: str) -> bytes:
    """Decodificar base64"""
    return base64.b64decode(data)

def url_encode(data: str) -> str:
    """Codificar URL"""
    return quote(data, safe='')

def url_decode(data: str) -> str:
    """Decodificar URL"""
    return unquote(data)

def json_serialize(obj: Any) -> str:
    """Serializar objeto para JSON"""
    def default_serializer(obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        elif isinstance(obj, Decimal):
            return float(obj)
        elif hasattr(obj, 'to_dict'):
            return obj.to_dict()
        elif hasattr(obj, '__dict__'):
            return obj.__dict__
        else:
            return str(obj)
    
    return json.dumps(obj, default=default_serializer, ensure_ascii=False, indent=2)

def json_deserialize(data: str) -> Any:
    """Deserializar JSON para objeto"""
    return json.loads(data)

def deep_merge(dict1: Dict[str, Any], dict2: Dict[str, Any]) -> Dict[str, Any]:
    """Fazer merge profundo de dicionários"""
    result = dict1.copy()
    
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    
    return result

def flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '.') -> Dict[str, Any]:
    """Achatar dicionário aninhado"""
    items = []
    
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    
    return dict(items)

def unflatten_dict(d: Dict[str, Any], sep: str = '.') -> Dict[str, Any]:
    """Desfazer achatamento de dicionário"""
    result = {}
    
    for key, value in d.items():
        keys = key.split(sep)
        current = result
        
        for k in keys[:-1]:
            if k not in current:
                current[k] = {}
            current = current[k]
        
        current[keys[-1]] = value
    
    return result

def remove_none_values(d: Dict[str, Any]) -> Dict[str, Any]:
    """Remover valores None de dicionário"""
    return {k: v for k, v in d.items() if v is not None}

def calculate_age(birth_date: date) -> int:
    """Calcular idade a partir da data de nascimento"""
    today = date.today()
    age = today.year - birth_date.year
    
    # Ajustar se ainda não fez aniversário este ano
    if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
        age -= 1
    
    return age

def calculate_bmi(weight: float, height: float) -> float:
    """Calcular IMC (Índice de Massa Corporal)"""
    if height <= 0:
        return 0
    
    # Converter altura para metros se estiver em centímetros
    if height > 3:
        height = height / 100
    
    return round(weight / (height ** 2), 2)

def classify_bmi(bmi: float) -> str:
    """Classificar IMC"""
    if bmi < 18.5:
        return "Abaixo do peso"
    elif bmi < 25:
        return "Peso normal"
    elif bmi < 30:
        return "Sobrepeso"
    elif bmi < 35:
        return "Obesidade grau I"
    elif bmi < 40:
        return "Obesidade grau II"
    else:
        return "Obesidade grau III"

def calculate_target_heart_rate(age: int, resting_hr: int = 60) -> Dict[str, int]:
    """Calcular frequência cardíaca alvo"""
    max_hr = 220 - age
    hr_reserve = max_hr - resting_hr
    
    return {
        'max_hr': max_hr,
        'fat_burn_min': int(resting_hr + (hr_reserve * 0.5)),
        'fat_burn_max': int(resting_hr + (hr_reserve * 0.7)),
        'cardio_min': int(resting_hr + (hr_reserve * 0.7)),
        'cardio_max': int(resting_hr + (hr_reserve * 0.85)),
        'peak_min': int(resting_hr + (hr_reserve * 0.85)),
        'peak_max': max_hr
    }

def generate_exercise_schedule(start_date: date, duration_weeks: int, frequency_per_week: int) -> List[date]:
    """Gerar cronograma de exercícios"""
    schedule = []
    current_date = start_date
    
    for week in range(duration_weeks):
        week_start = current_date + timedelta(weeks=week)
        
        # Distribuir exercícios na semana
        if frequency_per_week == 1:
            schedule.append(week_start + timedelta(days=2))  # Quarta
        elif frequency_per_week == 2:
            schedule.extend([
                week_start + timedelta(days=1),  # Terça
                week_start + timedelta(days=4)   # Sexta
            ])
        elif frequency_per_week == 3:
            schedule.extend([
                week_start + timedelta(days=0),  # Segunda
                week_start + timedelta(days=2),  # Quarta
                week_start + timedelta(days=4)   # Sexta
            ])
        elif frequency_per_week >= 4:
            # Todos os dias úteis
            for day in range(5):
                schedule.append(week_start + timedelta(days=day))
    
    return schedule

def calculate_treatment_progress(start_date: date, end_date: date, sessions_completed: int, total_sessions: int) -> Dict[str, Any]:
    """Calcular progresso do tratamento"""
    today = date.today()
    
    # Calcular duração total e decorrida
    total_days = (end_date - start_date).days
    elapsed_days = (today - start_date).days
    
    # Calcular porcentagens
    time_progress = min(100, max(0, (elapsed_days / total_days) * 100)) if total_days > 0 else 0
    session_progress = (sessions_completed / total_sessions) * 100 if total_sessions > 0 else 0
    
    # Determinar status
    if today > end_date:
        status = "Concluído" if sessions_completed >= total_sessions else "Atrasado"
    elif session_progress >= time_progress:
        status = "No prazo"
    else:
        status = "Atrasado"
    
    return {
        'time_progress': round(time_progress, 1),
        'session_progress': round(session_progress, 1),
        'sessions_completed': sessions_completed,
        'total_sessions': total_sessions,
        'sessions_remaining': max(0, total_sessions - sessions_completed),
        'days_elapsed': elapsed_days,
        'total_days': total_days,
        'days_remaining': max(0, (end_date - today).days),
        'status': status
    }

def format_duration(minutes: int) -> str:
    """Formatar duração em minutos para string legível"""
    if minutes < 60:
        return f"{minutes} min"
    
    hours = minutes // 60
    remaining_minutes = minutes % 60
    
    if remaining_minutes == 0:
        return f"{hours}h"
    else:
        return f"{hours}h {remaining_minutes}min"

def parse_duration(duration_str: str) -> int:
    """Converter string de duração para minutos"""
    duration_str = duration_str.lower().strip()
    
    # Padrões comuns
    if 'h' in duration_str and 'min' in duration_str:
        # Ex: "1h 30min"
        parts = duration_str.replace('h', '').replace('min', '').split()
        hours = int(parts[0]) if parts[0] else 0
        minutes = int(parts[1]) if len(parts) > 1 and parts[1] else 0
        return hours * 60 + minutes
    elif 'h' in duration_str:
        # Ex: "2h"
        hours = int(duration_str.replace('h', ''))
        return hours * 60
    elif 'min' in duration_str:
        # Ex: "45min"
        minutes = int(duration_str.replace('min', ''))
        return minutes
    else:
        # Assumir que é em minutos
        return int(duration_str)

def generate_color_palette(base_color: str, count: int = 5) -> List[str]:
    """Gerar paleta de cores baseada em uma cor"""
    # Cores pré-definidas para o sistema
    palettes = {
        'blue': ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5'],
        'green': ['#E8F5E8', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A'],
        'orange': ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726'],
        'red': ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350'],
        'purple': ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC'],
        'teal': ['#E0F2F1', '#B2DFDB', '#80CBC4', '#4DB6AC', '#26A69A']
    }
    
    # Retornar paleta baseada na cor ou padrão
    for color_name, palette in palettes.items():
        if color_name in base_color.lower():
            return palette[:count]
    
    # Paleta padrão
    return palettes['blue'][:count]

def mask_sensitive_info(text: str, mask_char: str = '*') -> str:
    """Mascarar informações sensíveis em texto"""
    # Mascarar CPF
    text = re.sub(r'\b\d{3}\.\d{3}\.\d{3}-\d{2}\b', 
                  lambda m: m.group()[:3] + '.' + mask_char*3 + '.' + mask_char*3 + '-' + m.group()[-2:], text)
    
    # Mascarar telefone
    text = re.sub(r'\(\d{2}\)\s*\d{4,5}-\d{4}', 
                  lambda m: m.group()[:5] + mask_char*4 + m.group()[-5:], text)
    
    # Mascarar email
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 
                  lambda m: m.group()[:2] + mask_char*3 + '@' + m.group().split('@')[1], text)
    
    return text

def create_audit_trail(action: str, resource: str, resource_id: str, user_id: str, 
                      old_values: Dict[str, Any] = None, new_values: Dict[str, Any] = None) -> Dict[str, Any]:
    """Criar trilha de auditoria"""
    return {
        'timestamp': datetime.utcnow().isoformat(),
        'action': action,
        'resource': resource,
        'resource_id': resource_id,
        'user_id': user_id,
        'old_values': old_values,
        'new_values': new_values,
        'ip_address': request.remote_addr if 'request' in globals() else None,
        'user_agent': request.headers.get('User-Agent') if 'request' in globals() else None
    }

def calculate_business_days(start_date: date, end_date: date) -> int:
    """Calcular dias úteis entre duas datas"""
    business_days = 0
    current_date = start_date
    
    while current_date <= end_date:
        if current_date.weekday() < 5:  # 0-4 são dias úteis (segunda a sexta)
            business_days += 1
        current_date += timedelta(days=1)
    
    return business_days

def get_next_business_day(start_date: date, days_ahead: int = 1) -> date:
    """Obter próximo dia útil"""
    current_date = start_date
    business_days_found = 0
    
    while business_days_found < days_ahead:
        current_date += timedelta(days=1)
        if current_date.weekday() < 5:  # Dia útil
            business_days_found += 1
    
    return current_date

def is_business_day(check_date: date) -> bool:
    """Verificar se é dia útil"""
    return check_date.weekday() < 5

def get_brazilian_holidays(year: int) -> List[date]:
    """Obter feriados brasileiros para um ano"""
    holidays = [
        date(year, 1, 1),   # Confraternização Universal
        date(year, 4, 21),  # Tiradentes
        date(year, 5, 1),   # Dia do Trabalhador
        date(year, 9, 7),   # Independência do Brasil
        date(year, 10, 12), # Nossa Senhora Aparecida
        date(year, 11, 2),  # Finados
        date(year, 11, 15), # Proclamação da República
        date(year, 12, 25), # Natal
    ]
    
    # Adicionar feriados móveis (Carnaval, Páscoa, etc.) seria mais complexo
    # Por simplicidade, retornamos apenas os fixos
    
    return holidays