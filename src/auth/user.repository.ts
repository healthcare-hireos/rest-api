import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm"
import { AuthCredentialsDto } from "./auth-credentials.dto"
import { User } from "./user.entity"
import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UserRepository extends Repository <User> {
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { email, password } = authCredentialsDto;
    
    const user = new User();
    user.email = email;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password,user.salt);
    try {
      await user.save();
    } catch (error) {
      if (error.code === '23505') {
      throw new ConflictException('email already exists')
      } else {
        throw new InternalServerErrorException()
      }
    }
    
  }

  async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<string>{
    const { email, password } = authCredentialsDto;
    const user = await this.findOne({ email });
    if (user && await user.validatePassword(password)) {
      return user.email;
    }
    return null;
  }
  private async hashPassword(password: string, salt: string): Promise<string>{
    return bcrypt.hash(password, salt);
  }
}