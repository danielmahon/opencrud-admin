export const resources = [
  {
    type: 'User',
    icon: 'people',
    list: {
      fields: [
        { source: 'name', type: 'Text' },
        { source: 'email', type: 'Text' },
        { source: 'createdAt', type: 'DateTime' },
        { source: 'updatedAt', type: 'DateTime' },
      ],
    },
    edit: {
      fields: [
        { source: 'name', type: 'Text' },
        { source: 'email', type: 'Text' },
        { source: 'id', type: 'Text' },
        { source: 'createdAt', type: 'DateTime' },
        { source: 'updatedAt', type: 'DateTime' },
      ],
    },
  },
  {
    type: 'Post',
    icon: 'library_books',
    list: {
      fields: [
        { source: 'title', type: 'Text' },
        { source: 'isPublished', type: 'Boolean' },
        { source: 'createdAt', type: 'DateTime' },
        { source: 'updatedAt', type: 'DateTime' },
        { source: 'author.name', type: 'Reference:User' },
      ],
    },
    edit: {
      fields: [
        { source: 'title', type: 'Text' },
        { source: 'content', type: 'Text' },
        { source: 'id', type: 'Text' },
        { source: 'isPublished', type: 'Boolean' },
        { source: 'createdAt', type: 'DateTime' },
        { source: 'updatedAt', type: 'DateTime' },
        { source: 'author.name', type: 'Reference:User' },
      ],
    },
  },
  {
    type: 'Image',
    icon: 'collections',
    list: {
      fields: [
        { source: 'src', type: 'Image' },
        { source: 'title', type: 'Text' },
        { source: 'createdAt', type: 'DateTime' },
        { source: 'updatedAt', type: 'DateTime' },
      ],
    },
    edit: {
      fields: [
        { source: 'title', type: 'Text' },
        { source: 'id', type: 'Text' },
        { source: 'src', type: 'Image' },
        { source: 'createdAt', type: 'DateTime' },
        { source: 'updatedAt', type: 'DateTime' },
      ],
    },
  },
];
