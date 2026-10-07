'use server'

import pool from './db';
import { RowDataPacket } from 'mysql2';

export interface AnnouncementItem {
    id: number;
    title: string;
    slug: string;
    date: string;
}

export interface AnnouncementDetail {
    title: string;
    content: string;
    date: string;
}

// 1. Fungsi ambil semua daftar pengumuman
export async function getAnnouncements(): Promise<AnnouncementItem[]> {
    try {
        const query = `
      SELECT 
        p.ID as id,
        p.post_title AS title,
        p.post_name AS slug,
        p.post_date AS raw_date
      FROM wp_posts p
      JOIN wp_term_relationships tr ON p.ID = tr.object_id
      JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
      JOIN wp_terms t ON tt.term_id = t.term_id
      WHERE t.slug = 'pengumuman' 
        AND p.post_status = 'publish'
      ORDER BY p.post_date DESC;
    `;

        const [rows] = await pool.query<RowDataPacket[]>(query);

        return rows.map((row) => ({
            id: row.id,
            title: row.title,
            slug: row.slug,
            date: new Date(row.raw_date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }),
        }));
    } catch (error) {
        console.error('Gagal mengambil data pengumuman:', error);
        return [];
    }
}

// 2. Fungsi ambil 1 detail pengumuman berdasarkan slug
export async function getAnnouncementBySlug(slug: string): Promise<AnnouncementDetail | null> {
    try {
        const query = `
      SELECT 
        post_title AS title,
        post_date AS raw_date,
        post_content AS content
      FROM wp_posts 
      WHERE post_name = ? AND post_status = 'publish'
      LIMIT 1;
    `;

        const [rows] = await pool.query<RowDataPacket[]>(query, [slug]);

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            title: row.title,
            content: row.content,
            date: new Date(row.raw_date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }),
        };
    } catch (error) {
        console.error('Gagal mengambil detail pengumuman:', error);
        return null;
    }
}