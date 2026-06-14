import { renderToStaticMarkup } from 'react-dom/server';
import { ProductImageInput } from './ProductImageInput';
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_MAX_BYTES,
  validateProductImageFile,
} from './ProductImageInput.logic';

jest.mock('@/lib/api-products', () => ({
  productsApi: { uploadImage: jest.fn() },
  resolveProductImageUrl: (imageUrl: string) =>
    imageUrl.startsWith('/') ? `http://api.test${imageUrl}` : imageUrl,
}));

describe('ProductImageInput coverage', () => {
  it('validates product image files before upload', () => {
    expect(validateProductImageFile()).toBe('');
    expect(validateProductImageFile({ size: 10, type: 'text/plain' } as File)).toBe(
      'Vui lòng chọn file ảnh.',
    );
    expect(validateProductImageFile({ size: PRODUCT_IMAGE_MAX_BYTES + 1, type: 'image/png' } as File)).toBe(
      'Ảnh phải nhỏ hơn 5MB.',
    );
    expect(validateProductImageFile({ size: PRODUCT_IMAGE_MAX_BYTES, type: 'image/webp' } as File)).toBe('');
  });

  it('renders upload controls, accepted image types, and empty preview state', () => {
    const html = renderToStaticMarkup(<ProductImageInput value="" onChange={jest.fn()} />);

    expect(html).toContain('Tải ảnh từ thiết bị');
    expect(html).toContain(PRODUCT_IMAGE_ACCEPT);
    expect(html).toContain('Hỗ trợ JPG, PNG, WEBP, GIF. Tối đa 5MB.');
    expect(html).not.toContain('Xóa ảnh');
  });

  it('renders an existing uploaded image and remove action', () => {
    const html = renderToStaticMarkup(
      <ProductImageInput value="/uploads/products/tenant/product.png" onChange={jest.fn()} />,
    );

    expect(html).toContain('src="http://api.test/uploads/products/tenant/product.png"');
    expect(html).toContain('alt="Ảnh sản phẩm"');
    expect(html).toContain('Xóa ảnh');
  });

  it('disables controls when the parent form is disabled', () => {
    const html = renderToStaticMarkup(<ProductImageInput value="" onChange={jest.fn()} disabled />);

    expect(html).toContain('disabled=""');
  });
});
