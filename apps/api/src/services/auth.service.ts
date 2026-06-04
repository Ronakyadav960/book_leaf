import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errors.js";
import { signToken } from "../middleware/auth.js";

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    return { user: safeUser, token: signToken({ id: user.id, email: user.email, role: user.role }) };
  }
}
