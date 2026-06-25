from datetime import timedelta

output_ass = r'C:\Users\a1246\Desktop\医保经办助手\demo_subtitles.ass'

subtitles = [
    (0, 4, '医保经办助手'),
    (4, 8, '像聊微信一样办医保'),
    (8, 13, '语音提问：我想去上海看病，怎么备案？'),
    (13, 18, '已为您找到异地就医备案政策'),
    (18, 22, '来源：南京市医疗保障局'),
    (22, 26, '是否需要我现在帮您办理？'),
    (26, 32, '系统自动预填个人信息'),
    (32, 37, '一键确认，无需重复填写'),
    (37, 42, '备案成功 · 生成电子凭证'),
    (42, 48, '上传发票，智能识别'),
    (48, 55, '自动提取医院、项目、金额'),
    (55, 62, '自动计算可报销金额'),
    (62, 70, '个人账户余额、消费趋势一目了然'),
    (70, 78, '报销记录随时可查'),
    (78, 86, '医保经办助手 · 让医保服务更简单'),
]


def fmt(seconds: float) -> str:
    td = timedelta(seconds=seconds)
    hours, remainder = divmod(td.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    centiseconds = td.microseconds // 10000
    return f'{hours}:{minutes:02d}:{seconds:02d}.{centiseconds:02d}'


header = """[Script Info]
Title: Demo Subtitles
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,SimHei,36,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,3,0,2,10,10,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

dialogues = []
for idx, (start, end, text) in enumerate(subtitles, 1):
    dialogues.append(f'Dialogue: 0,{fmt(start)},{fmt(end)},Default,,0,0,0,,{text}')

with open(output_ass, 'w', encoding='utf-8') as f:
    f.write(header + '\n'.join(dialogues) + '\n')

print(f'ASS 字幕已生成: {output_ass}')
