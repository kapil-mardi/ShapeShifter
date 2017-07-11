import { polygonArea } from 'd3-polygon';

import { bisect } from './Add';
import { INVALID_INPUT, TOO_FEW_POINTS } from './Errors';
import { isFiniteNumber, samePoint } from './Math';
import { pathStringToRing } from './Svg';
import { Point, Ring } from './Types';

export function normalizeRing(ring: string | Ring, maxSegmentLength: number) {
  let skipBisect: boolean;

  if (typeof ring === 'string') {
    const converted: any = pathStringToRing(ring, maxSegmentLength);
    ring = converted.ring;
    skipBisect = converted.skipBisect;
  } else if (!Array.isArray(ring)) {
    throw new TypeError(INVALID_INPUT);
  }

  const points = ring.slice(0) as Ring;

  if (!validRing(points)) {
    throw new TypeError(INVALID_INPUT);
  }

  // No duplicate closing point for now
  if (points.length > 1 && samePoint(points[0], points[points.length - 1])) {
    points.pop();
  }

  // 3+ points to make a polygon
  if (points.length < 3) {
    throw new TypeError(TOO_FEW_POINTS);
  }

  const area = polygonArea(points);

  // Make all rings clockwise
  if (area > 0) {
    points.reverse();
  }

  if (!skipBisect && maxSegmentLength && isFiniteNumber(maxSegmentLength) && maxSegmentLength > 0) {
    bisect(points, maxSegmentLength);
  }

  return points;
}

function validRing(ring: Ring) {
  return ring.every(point => {
    return (
      Array.isArray(point) &&
      point.length >= 2 &&
      isFiniteNumber(point[0]) &&
      isFiniteNumber(point[1])
    );
  });
}
