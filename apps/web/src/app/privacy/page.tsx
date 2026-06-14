import Link from 'next/link';

export const metadata = {
  title: 'Quyền riêng tư',
  description: 'Chính sách quyền riêng tư của Smart ERP Next.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-5 py-12">
        <Link href="/" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
          Smart ERP Next
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Quyền riêng tư</h1>
        <div className="mt-6 space-y-5 text-slate-300">
          <p>
            Smart ERP Next xử lý dữ liệu tài khoản, doanh nghiệp và nghiệp vụ để cung cấp các tính năng ERP như bán hàng, kho, khách hàng, hóa đơn và báo cáo.
          </p>
          <p>
            Dữ liệu đăng nhập và dữ liệu doanh nghiệp được sử dụng cho mục đích vận hành hệ thống, xác thực người dùng, phân quyền và tách dữ liệu theo tenant.
          </p>
          <p>
            Chủ sở hữu tài khoản cần cấu hình môi trường production với mật khẩu mạnh, JWT secret riêng, HTTPS và cơ chế sao lưu phù hợp trước khi mở cho người dùng thật.
          </p>
        </div>
        <div className="mt-8">
          <Link href="/register" className="rounded-md bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300">
            Đăng ký sử dụng
          </Link>
        </div>
      </div>
    </main>
  );
}
