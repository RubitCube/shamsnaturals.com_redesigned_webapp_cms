import { useMemo } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const RichTextEditor = ({ value, onChange, placeholder = 'Enter content...' }: RichTextEditorProps) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ direction: 'rtl' }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  )

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'script',
    'direction',
    'color',
    'background',
    'align',
    'link',
    'image',
    'video',
  ]

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ minHeight: '300px' }}
      />
    </div>
  )
}

export default RichTextEditor

