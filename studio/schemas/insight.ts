import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'insight',
  title: 'Insight',
  type: 'document',
  fields: [
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      options: {
        list: [
          { title: 'Pulse', value: 'Pulse' },
          { title: 'Probe', value: 'Probe' },
          { title: 'Snap',  value: 'Snap'  },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
      hidden: ({ document }) => document?.format === 'Probe',
    }),
    defineField({
      name: 'pdfAsset',
      title: 'PDF',
      type: 'file',
      options: { accept: '.pdf' },
      hidden: ({ document }) => document?.format !== 'Probe',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  orderings: [
    {
      title: 'Date (newest first)',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      format: 'format',
      date: 'date',
    },
    prepare({ title, format, date }: { title: string; format: string; date: string }) {
      return {
        title,
        subtitle: `${format} — ${date}`,
      }
    },
  },
})
