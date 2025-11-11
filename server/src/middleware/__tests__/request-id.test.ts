import { describe, it, expect, vi } from 'vitest';
import { requestIdMiddleware } from '../request-id.js';

vi.mock('node:crypto', () => ({
  randomUUID: vi.fn().mockReturnValue('mock-uuid-1234'),
}));

describe('requestIdMiddleware', () => {
  const mockNext = vi.fn();

  it('should set req.requestId to a random uuid', () => {
    const req: any = {};
    const res: any = {};

    requestIdMiddleware(req, res, mockNext);

    expect(req.requestId).toBe('mock-uuid-1234');
    expect(mockNext).toHaveBeenCalled();
  });
});
