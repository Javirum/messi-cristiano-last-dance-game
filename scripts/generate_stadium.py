"""
Generate a custom aerial stadium background image.
Pitch area is exactly 1000x600 centered in the image,
matching the game canvas dimensions for pixel-perfect alignment.
"""

import math
import random
from PIL import Image, ImageDraw, ImageFilter

# ── Dimensions ──
IMG_W, IMG_H = 1800, 1080
PITCH_W, PITCH_H = 1000, 600
PITCH_X = (IMG_W - PITCH_W) // 2  # 400
PITCH_Y = (IMG_H - PITCH_H) // 2  # 240

random.seed(42)
cx, cy = IMG_W // 2, IMG_H // 2


def fill_ellipse_area(draw, cx, cy, rx_out, ry_out, rx_in, ry_in, base_color, noise=8):
    """Fill an elliptical ring with slight color noise for texture."""
    for y in range(max(0, int(cy - ry_out) - 1), min(IMG_H, int(cy + ry_out) + 2)):
        dy_out = (y - cy) / ry_out
        dy_in = (y - cy) / ry_in if ry_in > 0 else 0
        if abs(dy_out) > 1:
            continue
        # X range for this row in outer ellipse
        x_span_out = rx_out * math.sqrt(max(0, 1 - dy_out ** 2))
        x_span_in = rx_in * math.sqrt(max(0, 1 - dy_in ** 2)) if ry_in > 0 and abs(dy_in) <= 1 else 0
        for x in range(max(0, int(cx - x_span_out)), min(IMG_W, int(cx + x_span_out) + 1)):
            if abs(x - cx) < x_span_in:
                continue
            n = random.randint(-noise, noise)
            color = tuple(max(0, min(255, c + n)) for c in base_color)
            draw.point((x, y), fill=color)


def generate_stadium():
    img = Image.new('RGB', (IMG_W, IMG_H), (5, 5, 12))
    draw = ImageDraw.Draw(img)

    # ── 1. Stadium outer wall ──
    draw.ellipse([cx - 880, cy - 530, cx + 880, cy + 530], fill=(22, 22, 32))

    # ── 2. Stadium tiers with visible separation ──
    # Upper tier
    fill_ellipse_area(draw, cx, cy, 850, 510, 720, 430, (55, 50, 65), noise=12)

    # Tier separator (walkway)
    fill_ellipse_area(draw, cx, cy, 720, 430, 700, 418, (80, 75, 85), noise=5)

    # Middle tier
    fill_ellipse_area(draw, cx, cy, 700, 418, 600, 365, (65, 58, 75), noise=12)

    # Tier separator (walkway)
    fill_ellipse_area(draw, cx, cy, 600, 365, 585, 356, (88, 82, 92), noise=5)

    # Lower tier — closest to pitch, brightest
    fill_ellipse_area(draw, cx, cy, 585, 356, 530, 320, (75, 68, 85), noise=12)

    # ── 3. Dense crowd in all tiers ──
    print("Generating crowd...")
    for _ in range(400000):
        angle = random.uniform(0, 2 * math.pi)
        r_factor = random.uniform(0.52, 0.98)

        # Elliptical distribution
        x = cx + int(850 * r_factor * math.cos(angle))
        y = cy + int(510 * r_factor * math.sin(angle))

        if not (0 <= x < IMG_W and 0 <= y < IMG_H):
            continue

        # Skip pitch area (with margin for the track)
        if PITCH_X - 25 < x < PITCH_X + PITCH_W + 25 and PITCH_Y - 25 < y < PITCH_Y + PITCH_H + 25:
            continue

        # Verify within stadium bounds
        dx = (x - cx) / 850
        dy = (y - cy) / 510
        dist = math.sqrt(dx ** 2 + dy ** 2)
        if dist > 1:
            continue

        # Skip walkway areas
        d2 = math.sqrt(((x - cx) / 720) ** 2 + ((y - cy) / 430) ** 2)
        d3 = math.sqrt(((x - cx) / 600) ** 2 + ((y - cy) / 365) ** 2)
        if 0.97 < d2 < 1.03 or 0.97 < d3 < 1.03:
            continue

        # Crowd colors — vivid mix of team colors and clothing
        r_val = random.random()
        if r_val < 0.16:
            # Red jerseys (CR7)
            color = (random.randint(190, 245), random.randint(35, 75), random.randint(35, 75))
        elif r_val < 0.32:
            # Blue jerseys (Messi)
            color = (random.randint(35, 70), random.randint(70, 130), random.randint(180, 245))
        elif r_val < 0.44:
            # White shirts
            color = (random.randint(200, 250), random.randint(200, 250), random.randint(200, 250))
        elif r_val < 0.54:
            # Gold/yellow scarves
            color = (random.randint(210, 250), random.randint(180, 220), random.randint(40, 90))
        elif r_val < 0.62:
            # Green
            color = (random.randint(40, 80), random.randint(160, 220), random.randint(50, 90))
        elif r_val < 0.70:
            # Orange
            color = (random.randint(220, 255), random.randint(140, 185), random.randint(30, 70))
        elif r_val < 0.76:
            # Pink / magenta
            color = (random.randint(200, 240), random.randint(60, 110), random.randint(150, 200))
        elif r_val < 0.82:
            # Cyan / light blue
            color = (random.randint(60, 110), random.randint(190, 240), random.randint(210, 250))
        else:
            # Neutral casual — lighter tones
            base = random.randint(70, 130)
            color = (base + random.randint(-15, 20),
                     base + random.randint(-15, 15),
                     base + random.randint(-10, 25))

        # Gentle dimming for outermost rows only
        if dist > 0.88:
            dim = 0.72
            color = tuple(int(c * dim) for c in color)
        elif dist > 0.75:
            dim = 0.85
            color = tuple(int(c * dim) for c in color)

        # Draw the person — closer people are larger dots
        draw.point((x, y), fill=color)
        if dist < 0.75 and random.random() < 0.55:
            draw.point((x + 1, y), fill=color)
        if dist < 0.65 and random.random() < 0.4:
            draw.point((x, y + 1), fill=color)
            draw.point((x + 1, y + 1), fill=color)

    # ── 4. Track / pitch surround ──
    pad = 22
    # Brownish track
    draw.rounded_rectangle(
        [PITCH_X - pad, PITCH_Y - pad, PITCH_X + PITCH_W + pad, PITCH_Y + PITCH_H + pad],
        radius=6, fill=(62, 52, 44)
    )
    # Inner edge (sideline area)
    inner_pad = 8
    draw.rounded_rectangle(
        [PITCH_X - inner_pad, PITCH_Y - inner_pad,
         PITCH_X + PITCH_W + inner_pad, PITCH_Y + PITCH_H + inner_pad],
        radius=3, fill=(45, 80, 42)
    )

    # ── 5. Green pitch with grass stripes ──
    draw.rectangle(
        [PITCH_X, PITCH_Y, PITCH_X + PITCH_W, PITCH_Y + PITCH_H],
        fill=(60, 125, 58)
    )

    stripe_w = PITCH_W // 10
    for i in range(10):
        sx = PITCH_X + i * stripe_w
        if i % 2 == 0:
            c = (65, 135, 62)
        else:
            c = (52, 115, 50)
        draw.rectangle([sx, PITCH_Y, sx + stripe_w, PITCH_Y + PITCH_H], fill=c)

    # ── 6. Pitch markings ──
    line_color = (230, 230, 230)
    lw = 3

    # Boundary
    draw.rectangle(
        [PITCH_X + 3, PITCH_Y + 3, PITCH_X + PITCH_W - 3, PITCH_Y + PITCH_H - 3],
        outline=line_color, width=lw
    )

    # Center line
    mid_x = PITCH_X + PITCH_W // 2
    draw.line([(mid_x, PITCH_Y + 3), (mid_x, PITCH_Y + PITCH_H - 3)], fill=line_color, width=lw)

    # Center circle
    cc_r = 68
    draw.ellipse([mid_x - cc_r, cy - cc_r, mid_x + cc_r, cy + cc_r], outline=line_color, width=lw)
    draw.ellipse([mid_x - 5, cy - 5, mid_x + 5, cy + 5], fill=line_color)

    # Penalty areas
    pa_w, pa_h = 125, 290
    pa_top = cy - pa_h // 2
    draw.rectangle([PITCH_X + 3, pa_top, PITCH_X + 3 + pa_w, pa_top + pa_h], outline=line_color, width=lw)
    draw.rectangle([PITCH_X + PITCH_W - 3 - pa_w, pa_top, PITCH_X + PITCH_W - 3, pa_top + pa_h], outline=line_color, width=lw)

    # Goal areas
    ga_w, ga_h = 44, 150
    ga_top = cy - ga_h // 2
    draw.rectangle([PITCH_X + 3, ga_top, PITCH_X + 3 + ga_w, ga_top + ga_h], outline=line_color, width=lw)
    draw.rectangle([PITCH_X + PITCH_W - 3 - ga_w, ga_top, PITCH_X + PITCH_W - 3, ga_top + ga_h], outline=line_color, width=lw)

    # Penalty spots
    pen_dist = 85
    draw.ellipse([PITCH_X + 3 + pen_dist - 4, cy - 4, PITCH_X + 3 + pen_dist + 4, cy + 4], fill=line_color)
    draw.ellipse([PITCH_X + PITCH_W - 3 - pen_dist - 4, cy - 4, PITCH_X + PITCH_W - 3 - pen_dist + 4, cy + 4], fill=line_color)

    # Penalty arcs
    arc_r = 68
    draw.arc(
        [PITCH_X + 3 + pen_dist - arc_r, cy - arc_r, PITCH_X + 3 + pen_dist + arc_r, cy + arc_r],
        start=-52, end=52, fill=line_color, width=lw
    )
    draw.arc(
        [PITCH_X + PITCH_W - 3 - pen_dist - arc_r, cy - arc_r, PITCH_X + PITCH_W - 3 - pen_dist + arc_r, cy + arc_r],
        start=128, end=232, fill=line_color, width=lw
    )

    # Corner arcs
    cr = 14
    for (ccx, ccy, a1, a2) in [
        (PITCH_X + 3, PITCH_Y + 3, 0, 90),
        (PITCH_X + PITCH_W - 3, PITCH_Y + 3, 90, 180),
        (PITCH_X + PITCH_W - 3, PITCH_Y + PITCH_H - 3, 180, 270),
        (PITCH_X + 3, PITCH_Y + PITCH_H - 3, 270, 360),
    ]:
        draw.arc([ccx - cr, ccy - cr, ccx + cr, ccy + cr], start=a1, end=a2, fill=line_color, width=lw)

    # Goal nets (small rectangles behind goal lines)
    net_depth = 10
    goal_top = cy - ga_h // 2
    goal_bottom = cy + ga_h // 2
    draw.rectangle([PITCH_X - net_depth, goal_top + 30, PITCH_X, goal_bottom - 30], fill=(90, 90, 100), outline=(140, 140, 150), width=1)
    draw.rectangle([PITCH_X + PITCH_W, goal_top + 30, PITCH_X + PITCH_W + net_depth, goal_bottom - 30], fill=(90, 90, 100), outline=(140, 140, 150), width=1)

    # ── 7. Floodlights ──
    print("Adding floodlights...")
    light_layer = Image.new('RGBA', (IMG_W, IMG_H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(light_layer)

    lights = [
        (90, 60, 120), (IMG_W - 90, 60, 120),
        (90, IMG_H - 60, 120), (IMG_W - 90, IMG_H - 60, 120),
        (IMG_W // 2 - 350, 40, 90), (IMG_W // 2 + 350, 40, 90),
        (IMG_W // 2 - 350, IMG_H - 40, 90), (IMG_W // 2 + 350, IMG_H - 40, 90),
        (IMG_W // 2, 35, 70), (IMG_W // 2, IMG_H - 35, 70),
    ]
    for (fx, fy, max_r) in lights:
        for r in range(max_r, 0, -1):
            alpha = int(30 * (1 - r / max_r) ** 1.3)
            ld.ellipse([fx - r, fy - r, fx + r, fy + r], fill=(255, 250, 230, alpha))
        # Bright core
        ld.ellipse([fx - 8, fy - 8, fx + 8, fy + 8], fill=(255, 253, 242, 90))

    img = Image.alpha_composite(img.convert('RGBA'), light_layer).convert('RGB')

    # ── 8. Warm atmosphere glow over pitch ──
    glow = Image.new('RGBA', (IMG_W, IMG_H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for r in range(500, 0, -3):
        alpha = int(8 * (1 - r / 500) ** 0.7)
        gd.ellipse([cx - int(r * 1.6), cy - r, cx + int(r * 1.6), cy + r],
                    fill=(200, 170, 60, alpha))

    img = Image.alpha_composite(img.convert('RGBA'), glow).convert('RGB')

    # ── 9. Soft edge vignette ──
    print("Adding vignette...")
    vig = Image.new('RGBA', (IMG_W, IMG_H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vig)
    for r in range(int(max(IMG_W, IMG_H) * 0.95), int(max(IMG_W, IMG_H) * 0.55), -2):
        progress = 1 - (r - max(IMG_W, IMG_H) * 0.55) / (max(IMG_W, IMG_H) * 0.4)
        alpha = int(min(100, progress * 110))
        vd.ellipse([cx - int(r * 1.1), cy - r, cx + int(r * 1.1), cy + r],
                    outline=(0, 0, 0, alpha))

    img = Image.alpha_composite(img.convert('RGBA'), vig).convert('RGB')

    # ── 10. Slight blur on stands, keep pitch sharp ──
    sharp_pitch = img.crop((PITCH_X - 3, PITCH_Y - 3, PITCH_X + PITCH_W + 3, PITCH_Y + PITCH_H + 3)).copy()
    img = img.filter(ImageFilter.GaussianBlur(radius=1.2))
    img.paste(sharp_pitch, (PITCH_X - 3, PITCH_Y - 3))

    # ── Save ──
    out_path = 'public/images/stadium-bg.png'
    img.save(out_path, 'PNG', optimize=True)
    print(f'Saved {out_path} ({IMG_W}x{IMG_H})')
    print(f'Pitch: ({PITCH_X},{PITCH_Y}) size {PITCH_W}x{PITCH_H}')


if __name__ == '__main__':
    generate_stadium()
