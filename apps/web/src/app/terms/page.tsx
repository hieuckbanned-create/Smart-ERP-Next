import Link from 'next/link';

export const metadata = {
  title: 'Điều khoản sử dụng',
  description: 'Điều khoản sử dụng Smart ERP Next.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-5 py-12">
        <Link href="/" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
          Smart ERP Next
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Điều khoản sử dụng</h1>
        <div className="mt-6 space-y-5 text-slate-300">
          <p>
            Người dùng có trách nhiệm bảo vệ tài khoản, phân quyền nội bộ và tính chính xác của dữ liệu nghiệp vụ nhập vào hệ thống.
          </p>
          <p>
            Các tính năng ERP, báo cáo và tự động hóa cần được đối chiếu với quy trình vận hành của doanh nghiệp trước khi dùng cho quyết định tài chính hoặc pháp lý.
          </p>
          <p>
            Trước khi công bố production, đơn vị vận hành cần cấu hình tên miền, HTTPS, email hỗ trợ, sao lưu, giám sát và quy trình xử lý sự cố.
          </p>
        </div>
        <div className="mt-8 flex gap-3">
          <Link href="/register" className="rounded-md bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300">
            Đăng ký
          </Link>
          <Link href="/login" className="rounded-md border border-white/20 px-4 py-2 font-semibold text-white hover:bg-white/10">
            Đăng nhập
          </Link>
        </div>
      </div>
    </main>
  );
}
