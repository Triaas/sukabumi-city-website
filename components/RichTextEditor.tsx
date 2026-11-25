'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
    useEditor,
    EditorContent,
    type AnyExtension,
    type Editor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
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
    ImagePlus,
    Table as TableIcon,
    Upload,
    Trash2,
    Loader2,
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
            <Icon size={14} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
        </button>
    )
}

interface MenuBarProps {
    editor: Editor | null
    disabled?: boolean
    enableExtendedTools?: boolean
    onToggleFullscreen?: () => void
    onOpenLinkModal: () => void
    onOpenImageModal?: () => void
}

function MenuBar({
    editor,
    disabled = false,
    enableExtendedTools = false,
    onToggleFullscreen,
    onOpenLinkModal,
    onOpenImageModal,
}: MenuBarProps) {
    if (!editor) return null

    const isParagraphActive =
        editor.isActive('paragraph') &&
        !editor.isActive('heading', { level: 2 }) &&
        !editor.isActive('heading', { level: 3 }) &&
        !editor.isActive('blockquote')

    const isInsideTable = enableExtendedTools && editor.isActive('table')

    return (
        <div className="px-3.5 py-2 border-b border-slate-100 bg-[#fafafa] space-y-2">
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

                {enableExtendedTools && (
                    <>
                        <div className="w-px h-5 bg-slate-200 mx-1" />
                        {onOpenImageModal && (
                            <ToolbarButton
                                icon={ImagePlus}
                                label="Sisip Gambar"
                                active={editor.isActive('image')}
                                disabled={disabled}
                                onClick={onOpenImageModal}
                            />
                        )}
                        <ToolbarButton
                            icon={TableIcon}
                            label="Sisip Tabel (3x3)"
                            active={editor.isActive('table')}
                            disabled={disabled}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .insertTable({
                                        rows: 3,
                                        cols: 3,
                                        withHeaderRow: true,
                                    })
                                    .run()
                            }
                        />
                    </>
                )}

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

            {isInsideTable && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/70">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">
                        Tabel:
                    </span>
                    <button
                        type="button"
                        disabled={disabled || !editor.can().addRowBefore()}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            editor.chain().focus().addRowBefore().run()
                        }
                        className="h-6 px-2 rounded-md text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        + Baris Atas
                    </button>
                    <button
                        type="button"
                        disabled={disabled || !editor.can().addRowAfter()}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            editor.chain().focus().addRowAfter().run()
                        }
                        className="h-6 px-2 rounded-md text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        + Baris Bawah
                    </button>
                    <button
                        type="button"
                        disabled={disabled || !editor.can().deleteRow()}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().deleteRow().run()}
                        className="h-6 px-2 rounded-md text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Hapus Baris
                    </button>

                    <div className="w-px h-4 bg-slate-200 mx-0.5" />

                    <button
                        type="button"
                        disabled={disabled || !editor.can().addColumnBefore()}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            editor.chain().focus().addColumnBefore().run()
                        }
                        className="h-6 px-2 rounded-md text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        + Kolom Kiri
                    </button>
                    <button
                        type="button"
                        disabled={disabled || !editor.can().addColumnAfter()}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            editor.chain().focus().addColumnAfter().run()
                        }
                        className="h-6 px-2 rounded-md text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        + Kolom Kanan
                    </button>
                    <button
                        type="button"
                        disabled={disabled || !editor.can().deleteColumn()}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            editor.chain().focus().deleteColumn().run()
                        }
                        className="h-6 px-2 rounded-md text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Hapus Kolom
                    </button>

                    <div className="w-px h-4 bg-slate-200 mx-0.5" />

                    <button
                        type="button"
                        disabled={disabled || !editor.can().deleteTable()}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            editor.chain().focus().deleteTable().run()
                        }
                        className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <Trash2 size={11} aria-hidden="true" />
                        Hapus Tabel
                    </button>
                </div>
            )}
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
    enableExtendedTools?: boolean
    onUploadImage?: (file: File) => Promise<string>
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Tuliskan naskah lengkap di sini...',
    minHeight = '180px',
    minHeightClassName,
    disabled = false,
    enableExtendedTools = false,
    onUploadImage,
}: RichTextEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const imageFileInputRef = useRef<HTMLInputElement>(null)

    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [selectedText, setSelectedText] = useState('')

    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const [imageAlt, setImageAlt] = useState('')
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [imageUploadError, setImageUploadError] = useState('')

    const extensions = useMemo(() => {
        const base: AnyExtension[] = [
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
        ]

        if (enableExtendedTools) {
            base.push(
                Image.configure({
                    inline: false,
                    allowBase64: false,
                    HTMLAttributes: {
                        class: 'max-w-full h-auto rounded-xl my-4 mx-auto block shadow-sm',
                    },
                }),
                TableKit.configure({
                    table: {
                        resizable: true,
                        renderWrapper: true,
                    },
                })
            )
        }

        return base
    }, [enableExtendedTools, placeholder])

    const editor = useEditor({
        immediatelyRender: false,
        shouldRerenderOnTransaction: true,
        editable: !disabled,
        extensions,
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
            const hasExplicitScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
            const isAllowedScheme =
                /^https?:\/\//i.test(trimmed) ||
                /^mailto:/i.test(trimmed) ||
                /^tel:/i.test(trimmed)
            const isSafeRelative =
                /^\/(?![\/\\])/.test(trimmed) || trimmed.startsWith('#')

            if ((hasExplicitScheme && !isAllowedScheme) || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
                editor.chain().focus().extendMarkRange('link').unsetLink().run()
                setIsLinkModalOpen(false)
                return
            }

            const finalUrl =
                isAllowedScheme || isSafeRelative
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

    const handleOpenImageModal = () => {
        setImageUrl('')
        setImageAlt('')
        setImageUploadError('')
        setIsImageModalOpen(true)
    }

    const handleCloseImageModal = () => {
        if (isUploadingImage) return
        setIsImageModalOpen(false)
        editor?.commands.focus()
    }

    const handleImageFileSelect = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file || !onUploadImage || !editor) return

        setImageUploadError('')
        setIsUploadingImage(true)
        try {
            const uploadedUrl = await onUploadImage(file)
            if (!uploadedUrl) {
                throw new Error('URL gambar tidak diterima dari server.')
            }
            editor
                .chain()
                .focus()
                .setImage({
                    src: uploadedUrl,
                    alt: imageAlt.trim() || file.name,
                })
                .run()
            setIsImageModalOpen(false)
        } catch (error) {
            setImageUploadError(
                error instanceof Error
                    ? error.message
                    : 'Gagal mengunggah gambar.'
            )
        } finally {
            setIsUploadingImage(false)
        }
    }

    const applyImageUrl = () => {
        if (!editor) return
        const trimmed = imageUrl.trim()
        if (!trimmed) {
            setImageUploadError('Masukkan URL gambar atau unggah berkas.')
            return
        }
        const isSafeUrl =
            /^https?:\/\//i.test(trimmed) || /^\/(?![\/\\])/.test(trimmed)
        if (!isSafeUrl) {
            setImageUploadError(
                'URL gambar harus diawali dengan https://, http://, atau /.'
            )
            return
        }
        editor
            .chain()
            .focus()
            .setImage({
                src: trimmed,
                alt: imageAlt.trim() || 'Ilustrasi konten',
            })
            .run()
        setIsImageModalOpen(false)
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
                enableExtendedTools={enableExtendedTools}
                onToggleFullscreen={handleToggleFullscreen}
                onOpenLinkModal={handleOpenLinkModal}
                onOpenImageModal={
                    enableExtendedTools ? handleOpenImageModal : undefined
                }
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

            {/* Modal Hyperlink */}
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
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-100 text-[#159447]">
                                <Link2
                                    className="h-6 w-6 stroke-[2]"
                                    aria-hidden="true"
                                />
                            </div>

                            <h3 className="mb-1 text-lg font-bold text-[#1b293c]">
                                {editor?.isActive('link')
                                    ? 'Edit Tautan'
                                    : 'Atur Tautan'}
                            </h3>

                            <p className="mb-4 text-xs text-[#66758a] whitespace-normal">
                                Masukkan alamat URL tautan (hyperlink)
                            </p>

                            {selectedText && (
                                <p className="mb-3.5 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 line-clamp-2 w-full text-center whitespace-normal">
                                    &ldquo;{selectedText}&rdquo;
                                </p>
                            )}

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

            {/* Modal Sisip Gambar (Upload / URL) */}
            {enableExtendedTools && isImageModalOpen && (
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
                    onClick={handleCloseImageModal}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="rte-image-modal-title"
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-100 text-[#159447]">
                                <ImagePlus
                                    className="h-5 w-5 stroke-[2]"
                                    aria-hidden="true"
                                />
                            </div>
                            <h3
                                id="rte-image-modal-title"
                                className="mb-1 text-lg font-bold text-[#1b293c]"
                            >
                                Sisip Gambar
                            </h3>
                            <p className="mb-4 text-xs text-[#66758a]">
                                Unggah berkas gambar atau masukkan URL gambar
                            </p>
                        </div>

                        <div className="space-y-3.5 text-left">
                            {onUploadImage && (
                                <div>
                                    <input
                                        ref={imageFileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageFileSelect}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        disabled={isUploadingImage}
                                        onClick={() =>
                                            imageFileInputRef.current?.click()
                                        }
                                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#159447]/50 bg-emerald-50/40 px-4 py-3 text-xs font-semibold text-[#159447] hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploadingImage ? (
                                            <>
                                                <Loader2
                                                    size={15}
                                                    className="animate-spin"
                                                    aria-hidden="true"
                                                />
                                                Mengunggah gambar...
                                            </>
                                        ) : (
                                            <>
                                                <Upload
                                                    size={15}
                                                    aria-hidden="true"
                                                />
                                                Unggah Gambar dari Perangkat
                                            </>
                                        )}
                                    </button>
                                    <p className="mt-1 text-[11px] text-slate-400 text-center">
                                        Format JPG, PNG, atau WebP (maks. 5 MB)
                                    </p>
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="rte-image-url"
                                    className="block text-xs font-semibold text-slate-700 mb-1"
                                >
                                    Atau URL Gambar
                                </label>
                                <input
                                    id="rte-image-url"
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => {
                                        setImageUrl(e.target.value)
                                        if (imageUploadError) {
                                            setImageUploadError('')
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            applyImageUrl()
                                        } else if (e.key === 'Escape') {
                                            e.preventDefault()
                                            handleCloseImageModal()
                                        }
                                    }}
                                    placeholder="/images/contoh.jpg atau https://..."
                                    className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="rte-image-alt"
                                    className="block text-xs font-semibold text-slate-700 mb-1"
                                >
                                    Teks Alternatif / Keterangan (Opsional)
                                </label>
                                <input
                                    id="rte-image-alt"
                                    type="text"
                                    value={imageAlt}
                                    onChange={(e) =>
                                        setImageAlt(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            applyImageUrl()
                                        } else if (e.key === 'Escape') {
                                            e.preventDefault()
                                            handleCloseImageModal()
                                        }
                                    }}
                                    placeholder="Deskripsi singkat gambar"
                                    className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#159447] focus:border-[#159447] focus:bg-white transition-all"
                                />
                            </div>

                            {imageUploadError && (
                                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    {imageUploadError}
                                </p>
                            )}
                        </div>

                        <div className="flex w-full gap-2.5 mt-5">
                            <button
                                type="button"
                                disabled={isUploadingImage}
                                onClick={handleCloseImageModal}
                                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isUploadingImage}
                                onClick={applyImageUrl}
                                className="flex-1 rounded-xl bg-[#159447] hover:bg-[#12803d] px-4 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                            >
                                Sisipkan URL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
