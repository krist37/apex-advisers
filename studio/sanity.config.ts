import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import insight from './schemas/insight';

export default defineConfig({
  name: 'apex-advisers',
  title: 'Apex Advisers',

  projectId: '05jvwhqa',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: [insight],
  },
});
