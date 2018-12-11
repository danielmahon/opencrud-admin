export const resources = [
  {
    type: 'User',
    icon: 'people',
    list: {
      fields: [
        { source: 'name' },
        { source: 'email' },
        { source: 'role' },
        { source: 'createdAt' },
        { source: 'updatedAt' },
      ],
    },
    edit: {
      fields: [
        { source: 'id' },
        { source: 'name' },
        { source: 'email', type: 'Email' },
        { source: 'password', type: 'Password' },
        { source: 'role' },
        { source: 'createdAt' },
        { source: 'updatedAt' },
      ],
    },
  },
  {
    type: 'Post',
    icon: 'library_books',
    list: {
      fields: [
        { source: 'title' },
        { source: 'isPublished' },
        { source: 'createdAt' },
        { source: 'updatedAt' },
        { source: 'author' },
      ],
    },
    edit: {
      fields: [
        { source: 'id' },
        { source: 'title' },
        { source: 'content', type: 'Editor', limit: 200 },
        { source: 'isPublished' },
        { source: 'author' },
        { source: 'createdAt' },
        { source: 'updatedAt' },
      ],
    },
  },
  {
    type: 'Image',
    icon: 'collections',
    list: {
      fields: [
        { source: 'src', type: 'Image' },
        { source: 'title' },
        { source: 'createdAt' },
        { source: 'updatedAt' },
      ],
    },
    edit: {
      fields: [
        { source: 'title' },
        { source: 'id' },
        { source: 'filename', disabled: true },
        { source: 'src', type: 'Image' },
        { source: 'createdAt' },
        { source: 'updatedAt' },
      ],
    },
  },
];
