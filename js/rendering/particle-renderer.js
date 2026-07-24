export class ParticleRenderer {
  draw(context, particles, texts, camera, viewportWidth, viewportHeight) {
    const halfWidth = viewportWidth / (camera.zoom * 2) + 80;
    const halfHeight = viewportHeight / (camera.zoom * 2) + 80;
    const minimumX = camera.x - halfWidth;
    const maximumX = camera.x + halfWidth;
    const minimumY = camera.y - halfHeight;
    const maximumY = camera.y + halfHeight;

    for (const particle of particles) {
      if (
        particle.x < minimumX ||
        particle.x > maximumX ||
        particle.y < minimumY ||
        particle.y > maximumY
      ) {
        continue;
      }

      const progress = particle.getProgress();

      context.globalAlpha = progress;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(
        particle.x,
        particle.y,
        particle.size * (0.35 + progress * 0.65),
        0,
        Math.PI * 2
      );
      context.fill();
    }

    context.globalAlpha = 1;

    for (const text of texts) {
      if (
        text.x < minimumX ||
        text.x > maximumX ||
        text.y < minimumY ||
        text.y > maximumY
      ) {
        continue;
      }

      const progress = text.getProgress();
      const scale = 0.82 + (1 - progress) * 0.24;

      context.save();
      context.translate(text.x, text.y);
      context.scale(scale, scale);
      context.globalAlpha = Math.min(1, progress * 1.8);
      context.font = "800 16px Inter, system-ui, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = text.color;
      context.shadowColor = "rgba(0, 0, 0, 0.7)";
      context.shadowBlur = 8;
      context.fillText(text.text, 0, 0);
      context.restore();
    }

    context.globalAlpha = 1;
  }
}
