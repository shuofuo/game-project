#!/usr/bin/env python3
"""生成12生肖×15级 SVG灵兽图形"""
import os

SVG_DIR = 'docs/svgs'
os.makedirs(SVG_DIR, exist_ok=True)

ZODIACS = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']
ZOD_HEX = [
    '#8B7355','#9B8B70','#D4761A','#C8A0B0','#2A6090',
    '#3A7A3A','#A07040','#D0C8A0','#B08040','#E0A020',
    '#A07050','#D0A0A0'
]

def ring_count(lvl):
    """灵光圈数量"""
    if lvl <= 3: return 0
    if lvl <= 6: return 1
    if lvl <= 9: return 2
    if lvl <= 12: return 3
    return 4

def filter_std(lvl):
    s = ring_count(lvl)
    return f'{s*2}'

def glow_color(z):
    h = ZOD_HEX[z]
    r,g,b = int(h[1:3],16),int(h[3:5],16),int(h[5:7],16)
    return f'#{r:02X}{g:02X}{b:02X}'

def light_hex(z, extra=0):
    h = ZOD_HEX[z]
    r,g,b = int(h[1:3],16),int(h[3:5],16),int(h[5:7],16)
    r=min(255,r+40+extra); g=min(255,g+40+extra); b=min(255,b+40+extra)
    return f'#{r:02X}{g:02X}{b:02X}'

def body_h(lvl):
    # Lv1/2/3 拉开更大差距，让升级视觉冲击更强
    lvls = {1:7, 2:9, 3:11}
    if lvl in lvls: return lvls[lvl]
    if lvl<=6: return 13
    if lvl<=9: return 15
    if lvl<=12: return 17
    return 19

def eye_size(lvl):
    # Lv1/2/3 眼睛更大差距
    lvls = {1:1.2, 2:1.6, 3:1.9}
    if lvl in lvls: return lvls[lvl]
    return 2.2 + (lvl-3)*0.1

# ─── 身体画法（每个生肖独立）───

def draw_body(z, lvl, body_color, light_color):
    bl = body_h(lvl)
    bx, by = 40, 42
    # 尾巴粗细随等级
    tw = 2.0 + (lvl-1)*0.1
    parts = []

    if z == 0: # 鼠
        parts.append(f'<ellipse cx="{bx}" cy="{by}" rx="{bl}" ry="{bl-1}" fill="{body_color}"/>')
        parts.append(f'<ellipse cx="{bx}" cy="{by}" rx="{bl-2}" ry="{bl-3}" fill="{light_color}" opacity="0.35"/>')
        ear_l = f'<polygon points="{bx-14},{by-2} {bx-18},{by-16} {bx-8},{by-6}" fill="{body_color}"/>'
        ear_r = f'<polygon points="{bx+14},{by-2} {bx+18},{by-16} {bx+8},{by-6}" fill="{body_color}"/>'
        ear_l_in = f'<polygon points="{bx-13},{by-3} {bx-15},{by-13} {bx-9},{by-6}" fill="{light_color}" opacity="0.5"/>'
        ear_r_in = f'<polygon points="{bx+13},{by-3} {bx+15},{by-13} {bx+9},{by-6}" fill="{light_color}" opacity="0.5"/>'
        parts.extend([ear_l, ear_r, ear_l_in, ear_r_in])
        parts.append(f'<ellipse cx="{bx}" cy="{by+bl+1}" rx="{tw}" ry="5" fill="{body_color}"/>')
        parts.append(f'<circle cx="{bx}" cy="{by}" r="{tw-0.5}" fill="{light_color}" opacity="0.4"/>')
        for dx in [-3,3]:
            es = eye_size(lvl)
            parts.append(f'<circle cx="{bx+dx}" cy="{by-1}" r="{es}" fill="#1A1A1A"/>')
            parts.append(f'<circle cx="{bx+dx+0.7}" cy="{by-1.7}" r="{es*0.35}" fill="white" opacity="0.8"/>')

    elif z == 1: # 牛
        parts.append(f'<ellipse cx="{bx}" cy="{by}" rx="{bl+2}" ry="{bl}" fill="{body_color}"/>')
        parts.append(f'<ellipse cx="{bx}" cy="{by}" rx="{bl}" ry="{bl-2}" fill="{light_color}" opacity="0.3"/>')
        horn_l = f'<path d="M{bx-12},{by-bl+4} Q{bx-20},{by-bl-10} {bx-14},{by-bl-16}" stroke="{body_color}" stroke-width="{3+max(0,(lvl-1)//3)}" fill="none" stroke-linecap="round"/>'
        horn_r = f'<path d="M{bx+12},{by-bl+4} Q{bx+20},{by-bl-10} {bx+14},{by-bl-16}" stroke="{body_color}" stroke-width="{3+max(0,(lvl-1)//3)}" fill="none" stroke-linecap="round"/>'
        parts.extend([horn_l, horn_r])
        nose = f'<ellipse cx="{bx}" cy="{by+bl-6}" rx="6" ry="4" fill="{light_color}" opacity="0.6"/>'
        parts.append(nose)
        for dx in [-6,6]:
            es = eye_size(lvl)
            parts.append(f'<circle cx="{bx+dx}" cy="{by-4}" r="{es}" fill="#1A1A1A"/>')
            parts.append(f'<circle cx="{bx+dx+0.7}" cy="{by-4.7}" r="{es*0.35}" fill="white" opacity="0.8"/>')

    elif z == 2: # 虎
        parts.append(f'<ellipse cx="{bx}" cy="{by}" rx="{bl}" ry="{bl+1}" fill="{body_color}"/>')
        parts.append(f'<ellipse cx="{bx}" cy="{by}" rx="{bl-2}" ry="{bl-1}" fill="{light_color}" opacity="0.35"/>')
        # 虎纹
        stripe_w = 2 + (lvl-1)*0.1
        for dy in [-6,-2,2]:
            parts.append(f'<path d="M{bx-10},{by+dy} L{bx+10},{by+dy}" stroke="{light_color}" stroke-width="{stripe_w}" opacity="0.5" stroke-linecap="round"/>')
        # 耳
        ear_l = f'<polygon points="{bx-14},{by-bl+6} {bx-18},{by-bl-8} {bx-8},{by-bl+4}" fill="{body_color}"/>'
        ear_r = f'<polygon points="{bx+14},{by-bl+6} {bx+18},{by-bl-8} {bx+8},{by-bl+4}" fill="{body_color}"/>'
        ear_l_in = f'<polygon points="{bx-13},{by-bl+5} {bx-16},{by-bl-6} {bx-9},{by-bl+4}" fill="{light_color}" opacity="0.6"/>'
        ear_r_in = f'<polygon points="{bx+13},{by-bl+5} {bx+16},{by-bl-6} {bx+9},{by-bl+4}" fill="{light_color}" opacity="0.6"/>'
        parts.extend([ear_l, ear_r, ear_l_in, ear_r_in])
        for dx in [-4,4]:
            es = eye_size(lvl)
            parts.append(f'<circle cx="{bx+dx}" cy="{by-2}" r="{es}" fill="#1A1A1A"/>')
            parts.append(f'<circle cx="{bx+dx+0.7}" cy="{by-2.7}" r="{es*0.35}" fill="white" opacity="0.8"/>')

    elif z == 3: # 兔
        parts.append(f'<ellipse cx="{bx}" cy="{by+2}" rx="{bl}" ry="{bl-1}" fill="{body_color}"/>')
        parts.append(f'<ellipse cx="{bx}" cy="{by+2}" rx="{bl-2}" ry="{bl-3}" fill="{light_color}" opacity="0.4"/>')
        # 长耳
        ear_h = 14 + (lvl-1)
        ear_l = f'<ellipse cx="{bx-10}" cy="{by-bl-ear_h//2+4}" rx="5" ry="{ear_h//2}" fill="{body_color}" transform="rotate(-10,{bx-10},{by-bl-ear_h//2+4})"/>'
        ear_r = f'<ellipse cx="{bx+10}" cy="{by-bl-ear_h//2+4}" rx="5" ry="{ear_h//2}" fill="{body_color}" transform="rotate(10,{bx+10},{by-bl-ear_h//2+4})"/>'
        ear_l_in = f'<ellipse cx="{bx-10}" cy="{by-bl-ear_h//2+4}" rx="3" ry="{ear_h//2-3}" fill="{light_color}" opacity="0.5" transform="rotate(-10,{bx-10},{by-bl-ear_h//2+4})"/>'
        ear_r_in = f'<ellipse cx="{bx+10}" cy="{by-bl-ear_h//2+4}" rx="3" ry="{ear_h//2-3}" fill="{light_color}" opacity="0.5" transform="rotate(10,{bx+10},{by-bl-ear_h//2+4})"/>'
        parts.extend([ear_l, ear_r, ear_l_in, ear_r_in])
        nose = f'<ellipse cx="{bx}" cy="{by+bl-2}" rx="3" ry="2" fill="#C090A0"/>'
        parts.append(nose)
        for dx in [-4,4]:
            es = eye_size(lvl)
            parts.append(f'<circle cx="{bx+dx}" cy="{by}" r="{es}" fill="#1A1A1A"/>')
            parts.append(f'<circle cx="{bx+dx+0.7}" cy="{by-0.7}" r="{es*0.35}" fill="white" opacity="0.8"/>')

    elif z == 4: # 龙
        parts.append(f'<path d="M{bx-10},{by+8} Q{bx-20},{by} {bx-8},{by-10} Q{bx},{by-18} {bx+8},{by-10} Q{bx+20},{by} {bx+10},{by+8} Q{bx+5},{by+14} {bx},{by+12} Q{bx-5},{by+14} {bx-10},{by+8}" fill="{body_color}"/>')
        parts.append(f'<ellipse cx="{bx}" cy="{by}" rx="{bl-3}" ry="{bl-4}" fill="{light_color}" opacity="0.4"/>')
        # 龙角
        horn_h = 10 + (lvl-1)*0.6
        horn_l = f'<path d="M{bx-7},{by-bl+5} Q{bx-12},{by-bl-horn_h} {bx-6},{by-bl-horn_h-4}" stroke="{light_color}" stroke-width="{2+max(0,(lvl-1)//4)}" fill="none" stroke-linecap="round"/>'
        horn_r = f'<path d="M{bx+7},{by-bl+5} Q{bx+12},{by-bl-horn_h} {bx+6},{by-bl-horn_h-4}" stroke="{light_color}" stroke-width="{2+max(0,(lvl-1)//4)}" fill="none" stroke-linecap="round"/>'
        parts.extend([horn_l, horn_r])
        # 龙须
        w_l = f'<path d="M{bx-4},{by} Q{bx-22},{by-5} {bx-28},{by}" stroke="{light_color}" stroke-width="1.2" fill="none" opacity="0.7"/>'
        w_r = f'<path d="M{bx+4},{by} Q{bx+22},{by-5} {bx+28},{by}" stroke="{light_color}" stroke-width="1.2" fill="none" opacity="0.7"/>'
        parts.extend([w_l, w_r])
        for dx in [-5,5]:
            es = eye_size(lvl)
            parts.append(f'<circle cx="{bx+dx}" cy="{by-3}" r="{es}" fill="#1A1A1A"/>')
            parts.append(f'<circle cx="{bx+dx+0.7}" cy="{by-3.7}" r="{es*0.35}" fill="white" opacity="0.8"/>')
        # 龙尾
        tail = f'<path d="M{bx},{by+12} Q{bx-5},{by+20} {bx},{by+26}" stroke="{body_color}" stroke-width="{tw}" fill="none" stroke-linecap="round"/>'
        parts.append(tail)

    elif z == 5: # 蛇
        parts.append(f'<ellipse cx="{bx}" cy="{by}" rx="{bl+1}" ry="{bl+2}" fill="{body_color}"/>')
        parts.append(f'<ellipse cx="{bx}" cy="{by}" rx="{bl-1}" ry="{bl}" fill="{light_color}" opacity="0.35"/>')
        # 鳞纹（竖向斑纹）
        for dy in [-4,0,4]:
            parts.append(f'<path d="M{bx-8},{by+dy} L{bx+8},{by+dy}" stroke="{light_color}" stroke-width="1.2" opacity="0.5" stroke-linecap="round"/>')
        # 蛇尾
        tail_len = 14 + (lvl-1)*0.5
        tail = f'<path d="M{bx},{by+bl+2} Q{bx+8},{by+bl+tail_len-5} {bx+4},{by+bl+tail_len}" stroke="{body_color}" stroke-width="{tw-0.5}" fill="none" stroke-linecap="round"/>'
        parts.append(tail)
        for dx in [-4,4]:
            es = eye_size(lvl)
            parts.append(f'<circle cx="{bx+dx}" cy="{by-2}" r="{es}" fill="#1A1A1A"/>')
            parts.append(f'<circle cx="{bx+dx+0.7}" cy="{by-2.7}" r="{es*0.35}" fill="white" opacity="0.8"/>')
            # 蛇瞳（竖瞳）
            parts.append(f'<ellipse cx="{bx+dx+0.7}" cy="{by-2}" rx="{es*0.25}" ry="{es*0.5}" fill="#1A1A1A" opacity="0.6"/>')

    elif z == 6: # 马
        parts.append(f'<ellipse cx="{bx}" cy="{by+1}" rx="{bl}" ry="{bl+1}" fill="{body_color}"/>')
        parts.append(f'<ellipse cx="{bx}" cy="{by+1}" rx="{bl-2}" ry="{bl-1}" fill="{light_color}" opacity="0.35"/>')
        # 鬃毛
        mane_h = 10 + (lvl-1)*0.5
        for i,dx in enumerate([-6,-3,0,3,6]):
            mh = mane_h - abs(i-2)*1.5
            if mh > 2:
                parts.append(f'<path d="M{bx+dx},{by-bl+4} Q{bx+dx-3},{by-bl-mh} {bx+dx+2},{by-bl-mh-3}" stroke="{body_color}" stroke-width="2" fill="none" stroke-linecap="round"/>')
        # 马耳
        ear_l = f'<polygon points="{bx-8},{by-bl+6} {bx-14},{by-bl-10} {bx-4},{by-bl+4}" fill="{body_color}"/>'
        ear_r = f'<polygon points="{bx+8},{by-bl+6} {bx+14},{by-bl-10} {bx+4},{by-bl+4}" fill="{body_color}"/>'
        parts.extend([ear_l, ear_r])
        for dx in [-5,5]:
            es = eye_size(lvl)
            parts.append(f'<circle cx="{bx+dx}" cy="{by-2}" r="{es}" fill="#1A1A1A"/>')
            parts.append(f'<circle cx="{bx+dx+0.7}" cy="{by-2.7}" r="{es*0.35}" fill="white" opacity="0.8"/>')

    elif z == 7: # 羊
        parts.append(f'<ellipse cx="{bx}" cy="{by+1}" rx="{bl}" ry="{bl-1}" fill="{body_color}"/>')
        parts.append(f'<ellipse cx="{bx}" cy="{by+1}" rx="{bl-2}" ry="{bl-3}" fill="{light_color}" opacity="0.4"/>')
        # 卷角
        horn_w = 2 + max(0,(lvl-1)//3)
        cx_l, cy_l = bx-12, by-bl+4
        cx_r, cy_r = bx+12, by-bl+4
        horn_l = f'<path d="M{cx_l},{cy_l} Q{cx_l-8},{cy_l-8} {cx_l-4},{cy_l-16} Q{cx_l+4},{cy_l-20} {cx_l+8},{cy_l-12}" stroke="{body_color}" stroke-width="{horn_w}" fill="none" stroke-linecap="round"/>'
        horn_r = f'<path d="M{cx_r},{cy_r} Q{cx_r+8},{cy_r-8} {cx_r+4},{cy_r-16} Q{cx_r-4},{cy_r-20} {cx_r-8},{cy_r-12}" stroke="{body_color}" stroke-width="{horn_w}" fill="none" stroke-linecap="round"/>'
        parts.extend([horn_l, horn_r])
        # 耳垂
        for ex in [-10,10]:
            parts.append(f'<ellipse cx="{bx+ex}" cy="{by-bl+8}" rx="3" ry="4" fill="{body_color}"/>')
        for dx in [-4,4]:
            es = eye_size(lvl)
            parts.append(f'<circle cx="{bx+dx}" cy="{by-2}" r="{es}" fill="#1A1A1A"/>')
            parts.append(f'<circle cx="{bx+dx+0.7}" cy="{by-2.7}" r="{es*0.35}" fill="white" opacity="0.8"/>')

    elif z == 8: # 猴
        parts.append(f'<ellipse cx="{bx}" cy="{by}" rx="{bl}" ry="{bl-1}" fill="{body_color}"/>')
        parts.append(f'<ellipse cx="{bx}" cy="{by}" rx="{bl-2}" ry="{bl-3}" fill="{light_color}" opacity="0.4"/>')
        # 圆耳
        parts.append(f'<circle cx="{bx-14}" cy="{by-8}" r="6" fill="{body_color}"/>')
        parts.append(f'<circle cx="{bx-14}" cy="{by-8}" r="4" fill="{light_color}" opacity="0.5"/>')
        parts.append(f'<circle cx="{bx+14}" cy="{by-8}" r="6" fill="{body_color}"/>')
        parts.append(f'<circle cx="{bx+14}" cy="{by-8}" r="4" fill="{light_color}" opacity="0.5"/>')
        # 桃心脸
        parts.append(f'<ellipse cx="{bx}" cy="{by+4}" rx="8" ry="6" fill="{light_color}" opacity="0.7"/>')
        nose = f'<ellipse cx="{bx}" cy="{by+3}" rx="3" ry="2" fill="#8B5030"/>'
        parts.append(nose)
        for dx in [-5,5]:
            es = eye_size(lvl)
            parts.append(f'<circle cx="{bx+dx}" cy="{by-2}" r="{es}" fill="#1A1A1A"/>')
            parts.append(f'<circle cx="{bx+dx+0.7}" cy="{by-2.7}" r="{es*0.35}" fill="white" opacity="0.8"/>')

    elif z == 9: # 鸡
        parts.append(f'<ellipse cx="{bx}" cy="{by+4}" rx="{bl-1}" ry="{bl}" fill="{body_color}"/>')
        parts.append(f'<ellipse cx="{bx}" cy="{by+4}" rx="{bl-3}" ry="{bl-2}" fill="{light_color}" opacity="0.4"/>')
        # 鸡冠（随等级变高变大）
        crest_h = 8 + (lvl-1)*0.6
        crest_pts = f'{bx},{by-bl-crest_h} {bx-5},{by-bl} {bx+5},{by-bl}'
        parts.append(f'<polygon points="{crest_pts}" fill="#E05030" opacity="0.9"/>')
        if lvl >= 7:
            parts.append(f'<polygon points="{bx-3},{by-bl-crest_h+4} {bx-7},{by-bl-crest_h-2} {bx},{by-bl-crest_h+6}" fill="#E05030" opacity="0.8"/>')
            parts.append(f'<polygon points="{bx+3},{by-bl-crest_h+4} {bx+7},{by-bl-crest_h-2} {bx},{by-bl-crest_h+6}" fill="#E05030" opacity="0.8"/>')
        # 鸡喙（三角形）
        parts.append(f'<polygon points="{bx},{by+bl+4} {bx-4},{by+bl+10} {bx+4},{by+bl+10}" fill="#D07020"/>')
        # 翅膀
        wing_y = by+4
        parts.append(f'<path d="M{bx-6},{wing_y} Q{bx-16},{wing_y-4} {bx-14},{wing_y+6}" stroke="{body_color}" stroke-width="3" fill="none" stroke-linecap="round"/>')
        parts.append(f'<path d="M{bx+6},{wing_y} Q{bx+16},{wing_y-4} {bx+14},{wing_y+6}" stroke="{body_color}" stroke-width="3" fill="none" stroke-linecap="round"/>')
        for dx in [-4,4]:
            es = eye_size(lvl)
            parts.append(f'<circle cx="{bx+dx}" cy="{by}" r="{es}" fill="#1A1A1A"/>')
            parts.append(f'<circle cx="{bx+dx+0.7}" cy="{by-0.7}" r="{es*0.35}" fill="white" opacity="0.8"/>')

    elif z == 10: # 狗
        parts.append(f'<ellipse cx="{bx}" cy="{by}" rx="{bl}" ry="{bl-1}" fill="{body_color}"/>')
        parts.append(f'<ellipse cx="{bx}" cy="{by}" rx="{bl-2}" ry="{bl-3}" fill="{light_color}" opacity="0.35"/>')
        # 竖耳
        ear_l = f'<polygon points="{bx-13},{by-bl+8} {bx-17},{by-bl-12} {bx-7},{by-bl+6}" fill="{body_color}"/>'
        ear_r = f'<polygon points="{bx+13},{by-bl+8} {bx+17},{by-bl-12} {bx+7},{by-bl+6}" fill="{body_color}"/>'
        ear_l_in = f'<polygon points="{bx-12},{by-bl+6} {bx-15},{by-bl-10} {bx-8},{by-bl+6}" fill="{light_color}" opacity="0.6"/>'
        ear_r_in = f'<polygon points="{bx+12},{by-bl+6} {bx+15},{by-bl-10} {bx+8},{by-bl+6}" fill="{light_color}" opacity="0.6"/>'
        parts.extend([ear_l, ear_r, ear_l_in, ear_r_in])
        # 狗鼻
        parts.append(f'<ellipse cx="{bx}" cy="{by+bl-3}" rx="4" ry="3" fill="#3A2010"/>')
        parts.append(f'<circle cx="{bx-1.2}" cy="{by+bl-3}" r="0.8" fill="#1A1A1A"/>')
        parts.append(f'<circle cx="{bx+1.2}" cy="{by+bl-3}" r="0.8" fill="#1A1A1A"/>')
        for dx in [-4,4]:
            es = eye_size(lvl)
            parts.append(f'<circle cx="{bx+dx}" cy="{by-3}" r="{es}" fill="#1A1A1A"/>')
            parts.append(f'<circle cx="{bx+dx+0.7}" cy="{by-3.7}" r="{es*0.35}" fill="white" opacity="0.8"/>')

    elif z == 11: # 猪
        parts.append(f'<ellipse cx="{bx}" cy="{by+2}" rx="{bl+1}" ry="{bl}" fill="{body_color}"/>')
        parts.append(f'<ellipse cx="{bx}" cy="{by+2}" rx="{bl-1}" ry="{bl-2}" fill="{light_color}" opacity="0.4"/>')
        # 小耳
        parts.append(f'<ellipse cx="{bx-12}" cy="{by-bl+4}" rx="6" ry="5" fill="{body_color}" transform="rotate(-20,{bx-12},{by-bl+4})"/>')
        parts.append(f'<ellipse cx="{bx+12}" cy="{by-bl+4}" rx="6" ry="5" fill="{body_color}" transform="rotate(20,{bx+12},{by-bl+4})"/>')
        parts.append(f'<ellipse cx="{bx-12}" cy="{by-bl+4}" rx="4" ry="3" fill="{light_color}" opacity="0.5" transform="rotate(-20,{bx-12},{by-bl+4})"/>')
        parts.append(f'<ellipse cx="{bx+12}" cy="{by-bl+4}" rx="4" ry="3" fill="{light_color}" opacity="0.5" transform="rotate(20,{bx+12},{by-bl+4})"/>')
        # 猪鼻（大而圆）
        parts.append(f'<ellipse cx="{bx}" cy="{by+bl+2}" rx="8" ry="5" fill="#C08080"/>')
        parts.append(f'<ellipse cx="{bx}" cy="{by+bl+2}" rx="6" ry="3.5" fill="#B07070"/>')
        parts.append(f'<circle cx="{bx-2.5}" cy="{by+bl+2}" r="1.5" fill="#904050"/>')
        parts.append(f'<circle cx="{bx+2.5}" cy="{by+bl+2}" r="1.5" fill="#904050"/>')
        for dx in [-5,5]:
            es = eye_size(lvl)
            parts.append(f'<circle cx="{bx+dx}" cy="{by-1}" r="{es}" fill="#1A1A1A"/>')
            parts.append(f'<circle cx="{bx+dx+0.7}" cy="{by-1.7}" r="{es*0.35}" fill="white" opacity="0.8"/>')

    return '\n    '.join(parts)

def generate_svg(z, lvl):
    zname = ZODIACS[z]
    bc = ZOD_HEX[z]
    lc = light_hex(z)
    rc = ring_count(lvl)
    fs = filter_std(lvl)
    fid = f'gf{z:02d}{lvl:02d}'
    bid = f'bgg{z:02d}{lvl:02d}'

    body = draw_body(z, lvl, bc, lc)

    # 灵气圈
    ring_html = ''
    if rc >= 1:
        r = 32 + (lvl-1)*0.5
        ring_html += f'<circle cx="40" cy="40" r="{r}" fill="none" stroke="{lc}80" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>'
    if rc >= 2:
        r = 36 + (lvl-1)*0.5
        ring_html += f'<circle cx="40" cy="38" r="{r}" fill="none" stroke="{lc}80" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>'
    if rc >= 3:
        r = 40 + (lvl-1)*0.5
        ring_html += f'<circle cx="40" cy="36" r="{r}" fill="none" stroke="{lc}80" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>'
    if rc >= 4:
        r = 44 + (lvl-1)*0.5
        ring_html += f'<circle cx="40" cy="34" r="{r}" fill="none" stroke="{lc}80" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"/>'

    # 高等级粒子光点
    particles = ''
    if lvl >= 8:
        ps = [
            (20,20,1.5,0.9),(60,20,1.6,0.9),(20,60,1.7,0.9),(60,60,1.8,0.9),
            (40,12,1.9,0.9),(12,40,2.0,0.9),(68,40,2.1,0.9),(10,10,1.4,0.8),(70,10,1.5,0.8),
            (10,70,1.3,0.8),(70,70,1.4,0.8),(40,70,1.2,0.7),(15,35,1.1,0.7),(65,35,1.2,0.7),
            (15,50,1.0,0.6),(65,50,1.1,0.6)
        ]
        for px,py,pr,pa in ps[:min(8, lvl-6)*2]:
            particles += f'<circle cx="{px}" cy="{py}" r="{pr}" fill="{lc}C0" opacity="{pa}"/>'

    # 等级文字（高等级显示）
    level_text = ''
    if lvl >= 10:
        level_text = f'<text x="40" y="76" text-anchor="middle" font-size="6.5" fill="{lc}C0" font-weight="bold" font-family="sans-serif">Lv{lvl}</text>'

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <defs>
    <filter id="{fid}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="{fs}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="{bid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="{lc}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="{bc}" stop-opacity="0.9"/>
    </radialGradient>
  </defs>
  {ring_html}
  <circle cx="40" cy="40" r="40" fill="url(#{bid})" filter="url(#{fid})"/>
  {body}
  {particles}
  {level_text}
</svg>'''
    return svg

# 生成所有180个
print("生成中...")
for z in range(12):
    for lvl in range(1, 16):
        path = f'{SVG_DIR}/drag_{z}_{lvl}.svg'
        svg = generate_svg(z, lvl)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(svg)
        print(f'  {ZODIACS[z]} z={z} Lv{lvl:02d} OK', flush=True)
print("\n全部生成完毕！")