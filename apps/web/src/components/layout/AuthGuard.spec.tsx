import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import AuthGuard from './AuthGuard';
import * as syncService from '@smart-erp/sync';
import * as socketLib from '@/lib/socket';

jest.mock('next/navigation');
jest.mock('react-i18next');
jest.mock('@smart-erp/sync');
jest.mock('@/lib/socket');

const mockRouter = {
  replace: jest.fn(),
};

const mockT = (key: string, fallback: string) => fallback;

describe('AuthGuard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should redirect to login when no token exists', async () => {
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });
  });

  it('should redirect to login when no user data exists', async () => {
    localStorage.setItem('access_token', 'test-token');

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });
  });

  it('should render loading state initially', () => {
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 'user-1', tenantId: 'tenant-1' }));

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('should initialize socket with user and tenant IDs', async () => {
    const mockUser = { id: 'user-1', tenantId: 'tenant-1' };
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(socketLib.initSocket).toHaveBeenCalledWith('user-1', 'tenant-1');
    });
  });

  it('should handle online/offline events', async () => {
    const mockUser = { id: 'user-1', tenantId: 'tenant-1' };
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    (syncService.syncService.processQueue as jest.Mock).mockResolvedValue(undefined);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    const onlineEvent = new Event('online');
    window.dispatchEvent(onlineEvent);

    await waitFor(() => {
      expect(syncService.syncService.processQueue).toHaveBeenCalled();
    });
  });

  it('should cleanup on unmount', async () => {
    const mockUser = { id: 'user-1', tenantId: 'tenant-1' };
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { unmount } = render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    unmount();

    expect(socketLib.closeSocket).toHaveBeenCalled();
  });
});
