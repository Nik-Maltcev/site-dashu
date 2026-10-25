"""Prepare lightweight self-hosted video variants from the documented stock source."""
from pathlib import Path
import subprocess
import imageio_ffmpeg

ROOT=Path(__file__).resolve().parents[1]
source=ROOT.parent/'output/design-references/barber-source.mp4'
target=ROOT/'assets/revision-02'
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
for width,name,crf in [(800,'barber.mp4','25'),(480,'barber-mobile.mp4','27')]:
    subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(source),'-an','-t','7','-vf',f'scale={width}:-2,fps=24','-c:v','libx264','-preset','medium','-crf',crf,'-pix_fmt','yuv420p','-movflags','+faststart',str(target/name)],check=True)
subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y','-ss','1.5','-i',str(source),'-frames:v','1','-vf','scale=800:-2','-quality','78',str(target/'barber-poster.webp')],check=True)
for name in ['barber.mp4','barber-mobile.mp4','barber-poster.webp']:
    print(name,(target/name).stat().st_size)
