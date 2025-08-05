interface Position {
  x: number;
  y: number;
}

export const calculateCardLayout = (
  count: number,
  width: number,
  height: number
): Position[] => {
  const positions: Position[] = [];
  const center = { x: width / 2, y: height / 2 };
  
  if (count === 0 || width === 0 || height === 0) return [];

  let participantsToPlace = [...Array(count).keys()];
  let ring = 0;
  const cardWidth = 110;
  const cardHeight = 110;

  while (participantsToPlace.length > 0) {
    const baseRadius = Math.min(width, height) * 0.18;
    const ringSpacing = Math.min(width, height) * 0.15;
    const radius = baseRadius + ring * ringSpacing;
    const circumference = 2 * Math.PI * radius;
    
    let maxInRing = Math.floor(circumference / cardWidth);
    if (maxInRing <= 0) maxInRing = 1;

    const numInThisRing = Math.min(participantsToPlace.length, maxInRing);
    const angleStep = (2 * Math.PI) / numInThisRing;

    for (let i = 0; i < numInThisRing; i++) {
      const participantIndex = participantsToPlace.shift()!;
      const angle = i * angleStep + (ring % 2) * (angleStep / 2);
      const x = center.x + radius * Math.cos(angle) - (cardWidth / 2);
      const y = center.y + radius * Math.sin(angle) - (cardHeight / 2);
      positions[participantIndex] = { x, y };
    }
    
    ring++;
    if (ring > 20) break; // Safety break
  }
  
  return positions;
};