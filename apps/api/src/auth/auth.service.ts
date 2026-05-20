import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { db } from "@smart-erp/database";
import { tenants, users } from "@smart-erp/database/schema";
import { eq } from "@smart-erp/database/drizzle";
import { UsersService } from "../users/users.service";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { I18nService } from "../i18n/i18n.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private notificationsGateway: NotificationsGateway,
    private i18n: I18nService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role ?? "user",
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        role: user.role ?? "user",
      },
    };
  }

  async register(
    email: string,
    password: string,
    name?: string,
    tenantId?: string,
    companyName?: string,
  ) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException("Email already in use");
    }

    const resolvedTenantId = tenantId ?? (await this.createTenantForSignup(companyName));
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert directly to include passwordHash (bypasses service which strips it)
    const [user] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: name ?? null,
        passwordHash: hashedPassword,
        tenantId: resolvedTenantId,
        role: tenantId ? "user" : "admin",
      })
      .returning();

    this.notificationsGateway.broadcast("user.registered", {
      id: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenantId,
      timestamp: new Date().toISOString(),
    });

    return this.login(user);
  }

  private async createTenantForSignup(companyName?: string): Promise<string> {
    const normalizedName = companyName?.trim();
    if (!normalizedName) {
      throw new BadRequestException(
        this.i18n.t("validation.required", undefined, { field: "companyName" }),
      );
    }

    const baseSlug = this.slugify(normalizedName);
    const slug = await this.uniqueTenantSlug(baseSlug);
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: normalizedName,
        slug,
      })
      .returning();

    return tenant.id;
  }

  private async uniqueTenantSlug(baseSlug: string): Promise<string> {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
      const [existing] = await db
        .select({ id: tenants.id })
        .from(tenants)
        .where(eq(tenants.slug, slug));
      if (!existing) return slug;
    }

    return `${baseSlug}-${Date.now().toString(36)}`;
  }

  private slugify(value: string): string {
    const slug = value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);

    return slug || `tenant-${Date.now().toString(36)}`;
  }
}
