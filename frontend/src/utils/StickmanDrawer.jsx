const drawStickman = (ctx, landmarks, canvasWidth, canvasHeight) => {
  if (!landmarks) return;

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 7], // Right arm
    [0, 4], [4, 5], [5, 6], [6, 8], // Left arm
    [9, 10], [11, 12], // Shoulders
    [11, 13], [13, 15], // Right leg
    [12, 14], [14, 16], // Left leg
    [11, 23], [12, 24], // Hips
    [23, 24], // Hip connection
    [23, 25], [25, 27], // Right lower leg
    [24, 26], [26, 28], // Left lower leg
  ];

  const colors = {
    arms: "cyan",
    legs: "lime",
    torso: "white",
  };

  ctx.lineWidth = 3; // Thicker lines for visibility

  connections.forEach(([start, end]) => {
    const p1 = landmarks[start];
    const p2 = landmarks[end];

    if (!p1 || !p2) return;

    ctx.beginPath();
    ctx.moveTo(canvasWidth - p1.x * canvasWidth, p1.y * canvasHeight);
    ctx.lineTo(canvasWidth - p2.x * canvasWidth, p2.y * canvasHeight);

    if ([1, 2, 3, 4, 5, 6].includes(start)) {
      ctx.strokeStyle = colors.arms;
    } else if ([13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(start)) {
      ctx.strokeStyle = colors.legs;
    } else {
      ctx.strokeStyle = colors.torso;
    }
    ctx.stroke();
  });

  // Draw joints as small red circles
  ctx.fillStyle = "red";
  landmarks.forEach((landmark) => {
    ctx.beginPath();
    ctx.arc(canvasWidth - landmark.x * canvasWidth, landmark.y * canvasHeight, 4, 0, 2 * Math.PI);
    ctx.fill();
  });
};

export default drawStickman;
