from datetime import timedelta

input_path = r'C:\Users\a1246\Videos\屏幕录制\屏幕录制 2026-06-25 141413.mp4'
output_srt = r'C:\Users\a1246\Videos\屏幕录制\demo_subtitles.srt'

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
    milliseconds = td.microseconds // 1000
    return f'{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}'


lines = []
for idx, (start, end, text) in enumerate(subtitles, 1):
    lines.append(str(idx))
    lines.append(f'{fmt(start)} --> {fmt(end)}')
    lines.append(text)
    lines.append('')

with open(output_srt, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f'SRT 字幕已生成: {output_srt}')
