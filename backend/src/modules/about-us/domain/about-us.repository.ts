import { AboutUs } from './about-us.entity';

export abstract class AboutUsRepository {
  abstract create(data: Partial<AboutUs>): AboutUs;
  abstract save(item: AboutUs): Promise<AboutUs>;
  abstract find(options?: any): Promise<AboutUs[]>;
  abstract findOne(options?: any): Promise<AboutUs | null>;
  abstract softDelete(id: string): Promise<void>;
}
