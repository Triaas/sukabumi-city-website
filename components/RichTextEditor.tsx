'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Link2,
    Undo2,
    Redo2,
    Maximize2,
} from 'lucide-react'

interface ToolbarButtonProps {
    icon: React.ElementType
    label: string
    active?: boolean
    disabled?: boolean
    onClick: () => void
}

function ToolbarButton({
    icon: Icon,
    label,
    active = false,
    disabled = false,
    onClick,
}: ToolbarButtonProps) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`flex items-center justify-center w-7 h-7 rounded-md border transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
                active
                    ? 'bg-[#dcfce7] text-[#159447] border-[#159447]/30 font-semibold shadow-2xs'
                    : 'text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-800'
            }`}
        >
            <Icon size={14} strokeWidth={active ? 2.4 : 2} />
        </button>
    )
}

interface MenuBarProps {
    editor: Editor | null
    disabled?: boolean
    onToggleFullscreen?: () => void
    onOpenLinkModal: () => void
}

function MenuBar({
    editor,
    disabled = false,
    onToggleFullscreen,
    onOpenLinkModal,
}: MenuBarProps) {
    if (!editor) return null

    const isParagraphActive =
        editor.isActive('paragraph') &&
        !editor.isActive('heading', { level: 2 }) &&
        !editor.isActive('heading', { level: 3 }) &&
        !editor.isActive('blockquote')

    return (
        <div className="px-3.5 py-2 border-b border-slate-100 bg-[#fafafa]">
            <div className="flex flex-wrap items-center gap-1">
                <ToolbarButton
                    icon={Bold}
                    label="Bold (Tebal)"
                    active={editor.isActive('bold')}
                    disabled={
                        disabled || !editor.can().chain().focus().toggleBold().run()
                    }
                    onClick={() => editor.chain().focus().toggleBold().run()}
                />
                <ToolbarButton
                    icon={Italic}
                    label="Italic (Miring)"
                    active={editor.isActive('italic')}
                    disabled={
                        disabled ||
                        !editor.can().chain().focus().toggleItalic().run()
                    }
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                />
                <ToolbarButton
                    icon={UnderlineIcon}
                    label="Underline (Garis Bawah)"
                    active={editor.isActive('underline')}
                    disabled={
                        disabled ||
                        !editor.can().chain().focus().toggleUnderline().run()
                    }
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                />

                <div className="w-px h-5 bg-slate-200 mx-1" />

                <ToolbarButton
                    icon={Heading2}
                    label="Heading 2"
                    active={editor.isActive('heading', { level: 2 })}
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                />
                <ToolbarButton
                    icon={Heading3}
                    label="Heading 3"
                    active={editor.isActive('heading', { level: 3 })}
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                />
                <button
                    type="button"
                    title="Format Paragraf Normal"
                    aria-pressed={isParagraphActive}
                    disabled={disabled}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={`flex items-center gap-1 h-7 px-2.5 rounded-md text-xs border transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
                        isParagraphActive
                            ? 'bg-[#dcfce7] text-[#159447] border-[#159447]/30 font-semibold shadow-2xs'
                            : 'text-slate-600 font-medium border-transparent hover:bg-slate-100 hover:text-slate-800'
                    }`}
                >
                    Paragraf
                </button>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                <ToolbarButton
                    icon={List}
                    label="Bullet List"
                    active={editor.isActive('bulletList')}
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                />
                <ToolbarButton
                    icon={ListOrdered}
                    label="Ordered List"
                    active={editor.isActive('orderedList')}
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                />
                <ToolbarButton
                    icon={Quote}
                    label="Blockquote"
                    active={editor.isActive('blockquote')}
                    disabled={disabled}
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                />
                <ToolbarButton
                    icon={Link2}
                    label="Tautan (Link)"
                    active={editor.isActive('link')}
                    disabled={disabled}
                    onClick={onOpenLinkModal}
                />

                <div className="w-px h-5 bg-slate-200 mx-1" />

                <ToolbarButton
                    icon={Undo2}
                    label="Undo"
                    disabled={
                        disabled || !editor.can().chain().focus().undo().run()
                    }
                    onClick={() => editor.chain().focus().undo().run()}
                />
                <ToolbarButton
                    icon={Redo2}
                    label="Redo"
                    disabled={
                        disabled || !editor.can().chain().focus().redo().run()
                    }
                    onClick={() => editor.chain().focus().redo().run()}
                />

                {onToggleFullscreen && (
                    <ToolbarButton
                        icon={Maximize2}
                        label="Layar Penuh"
                        onClick={onToggleFullscreen}
                    />
                )}
            </div>
        </div>
    )
}

export interface RichTextEditorProps {
    value: string
    onChange: (html: string) => void
    placeholder?: string
    minHeight?: string
    minHeightClassName?: string
    disabled?: boolean
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Tuliskan naskah lengkap di sini...',
    minHeight = '180px',
    minHeightClassName,
    disabled = false,
}: RichTextEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [selectedText, setSelectedText] = useState('')

    const editor = useEditor({
        immediatelyRender: false,
        shouldRerenderOnTransaction: true,
        editable: !disabled,
        extensions: [
            StarterKit.configure({
                underline: false,
                link: false,
                heading: {
                    levels: [2, 3],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
                HTMLAttributes: {
                    class: 'text-[#159447] underline cursor-pointer',
                    rel: 'noopener noreferrer',
                    target: '_blank',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                class: `px-5 py-4 bg-[#f8fafc] text-sm leading-relaxed text-slate-700 editor-content focus:outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#172135] [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#172135] [&_h3]:mt-2.5 [&_h3]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[#159447] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:my-2.5 ${
                    minHeightClassName || ''
                }`,
                style: minHeightClassName ? '' : `min-height: ${minHeight};`,
            },
        },
        onUpdate: ({ editor: currentEditor }) => {
            const html = currentEditor.isEmpty ? '' : currentEditor.getHTML()
            onChange(html)
        },
    })

    useEffect(() => {
        if (!editor) return
        editor.setEditable(!disabled)
    }, [editor, disabled])

    useEffect(() => {
        if (!editor) return
        const currentHtml = editor.isEmpty ? '' : editor.getHTML()
        const nextValue = value || ''

        if (nextValue !== currentHtml) {
            editor.commands.setContent(nextValue, { emitUpdate: false })
        }
    }, [value, editor])

    const handleToggleFullscreen = () => {
        if (!containerRef.current) return
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen?.()
        } else {
            document.exitFullscreen?.()
        }
    }

    const handleOpenLinkModal = () => {
        if (!editor) return
        const { from, to } = editor.state.selection
        const text = editor.state.doc.textBetween(from, to, ' ')
        setSelectedText(text.trim())

        const previousUrl = editor.getAttributes('link').href || ''
        setLinkUrl(previousUrl || 'https://')
        setIsLinkModalOpen(true)
    }

    const applyLink = () => {
        if (!editor) return
        const trimmed = linkUrl.trim()
        if (!trimmed || trimmed === 'https://' || trimmed === 'http://') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
        } else {
            const finalUrl =
                /^https?:\/\//i.test(trimmed) ||
                trimmed.startsWith('/') ||
                trimmed.startsWith('#') ||
                trimmed.startsWith('mailto:') ||
                trimmed.startsWith('tel:')
                    ? trimmed
                    : `https://${trimmed}`
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: finalUrl })
                .run()
        }
        setIsLinkModalOpen(false)
    }

    const removeLink = () => {
        if (!editor) return
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
        setIsLinkModalOpen(false)
    }

    const plainText = editor?.getText() || ''
    const wordCount = plainText
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length

    return (
        <div
            ref={containerRef}
            className="bg-white border border-slate-200/80 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#159447] focus-within:border-[#159447] transition-all flex flex-col"
        >
            <MenuBar
                editor={editor}
                disabled={disabled}
                onToggleFullscreen={handleToggleFullscreen}
                onOpenLinkModal={handleOpenLinkModal}
            />

            <div
                onClick={() => {
                    if (!disabled) editor?.commands.focus()
                }}
                className="flex-1 bg-[#f8fafc] cursor-text"
            >
                <EditorContent editor={editor} />
            </div>

            <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 bg-white">
                <span className="text-[11px] text-slate-500 font-medium">
                    {wordCount} Kata
                </span>
            </div>

            {/* Modal Hyperlink Sesuai Desain Gambar 2 */}
            {isLinkModalOpen && (
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
                    onClick={() => {
                        setIsLinkModalOpen(false)
                        editor?.commands.focus()
                    }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            {/* Icon Lingkaran di Atas (Identik Gambar 2) */}
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-100 text-[#159447]">
                                <Link2 className="h-6 w-6 stroke-[2]" />
                            </div>

                            {/* Judul Modal */}
                            <h3 className="mb-1 text-lg font-bold text-[#1b293c]">
                                {editor?.isActive('link')
                                    ? 'Edit Tautan'
                                    : 'Atur Tautan'}
                            </h3>

                            {/* Pesan Keterangan */}
                            <p className="mb-4 text-xs text-[#66758a] whitespace-normal">
                                Masukkan alamat URL tautan (hyperlink)
                            </p>

                            {/* Preview Teks Terpilih (jika ada) */}
                            {selectedText && (
                                <p className="mb-3.5 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 line-clamp-2 w-full text-center whitespace-normal">
                                    &ldquo;{selectedText}&rdquo;
                                </p>
                            )}

                            {/* Input URL */}
                            <div className="w-full mb-5">
                                <input
                                    type="text"
                                    autoFocus
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            applyLink()
                                        } else if (e.key === 'Escape') {
                                            e.preventDefault()
                                            setIsLinkModalOpen(false)
                                            editor?.commands.focus()
                                        }
                                    }}
                                    placeholder="https://sukabumikota.go.id"
                                    className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white transition-all text-center"
                                />
                            </div>

                            {/* Tombol Aksi Batal & Simpan / Hapus */}
                            <div className="flex w-full gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLinkModalOpen(false)
                                        editor?.commands.focus()
                                    }}
                                    className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Tidak
                                </button>
                                {editor?.isActive('link') && (
                                    <button
                                        type="button"
                                        onClick={removeLink}
                                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                        title="Hapus tautan ini"
                                    >
                                        Hapus
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={applyLink}
                                    className="flex-1 rounded-xl bg-[#159447] hover:bg-[#12803d] px-4 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
