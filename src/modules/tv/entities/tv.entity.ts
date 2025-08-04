import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TvStatus } from '../enum/status.enum';
import { TvCommentEntity } from './tvComment.entity';
import { TvCatEntity } from 'src/modules/tv-cats/entities/tv-cat.entity';
import { UploadEntity } from 'src/modules/upload/entities/upload.entity';


@Entity('tvs')
export class TvEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({})
  keywords_meta: string;

  @Column({})
  description_meta: string;

  @Column({ nullable: false, unique: true })
  slug: string;

  @Column({ nullable: false, unique: true })
  video_url: string;

  @Column({ nullable: false })
  content: string;


  @ManyToOne(() => UploadEntity, {
  nullable: true,
  onDelete: 'SET NULL',     // وقتی تصویر حذف شد، مقدار image در جدول tvs برابر null بشه
  onUpdate: 'CASCADE',      // اگر id تصویر تغییر کرد (نادر)، مقدار در tvs هم آپدیت بشه
  })
  image: UploadEntity;

  @Column()
  time: string;

  @Column({ nullable: false, default: TvStatus.Published })
  status: string;


  @ManyToMany(() => TvCatEntity, (tvCategory) => tvCategory.tvs)
  @JoinTable({
    name: 'tv_categories',
    joinColumn: { name: 'tv_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: TvCatEntity[];

  @OneToMany(() => TvCommentEntity, (tvComment) => tvComment.tv)
  comments: TvCommentEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  upated_at: Date;
}
