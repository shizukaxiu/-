from moviepy import VideoFileClip, TextClip, CompositeVideoClip

input_path = r'C:\Users\a1246\Videos\屏幕录制\屏幕录制 2026-06-25 141413.mp4'
output_path = r'C:\Users\a1246\Videos\屏幕录制\demo_with_subtitles.mp4'

# 字幕列表: (开始时间, 结束时间, 文字)
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

clip = VideoFileClip(input_path)
video_width, video_height = clip.size

subtitle_clips = []
for start, end, text in subtitles:
    txt = TextClip(
        text=text,
        font=r'C:\Windows\Fonts\simhei.ttf',
        font_size=56,
        color='white',
        stroke_color='black',
        stroke_width=3,
        method='caption',
        size=(video_width - 200, None),
        text_align='center',
        horizontal_align='center',
        vertical_align='center',
    )
    txt = txt.with_start(start).with_duration(end - start)
    txt = txt.with_position(('center', video_height - 160))
    subtitle_clips.append(txt)

final = CompositeVideoClip([clip] + subtitle_clips)
final.write_videofile(output_path, fps=clip.fps, codec='libx264', audio=False)

clip.close()
final.close()
print(f'输出完成: {output_path}')
