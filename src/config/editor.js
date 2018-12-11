import React from 'react';
import { pick, values } from 'lodash';
import { Icon } from '@rmwc/icon';
import { theme } from './index';

export const editor = {
  toolbar: {
    options: [
      'inline',
      'blockType',
      // 'fontSize',
      // 'fontFamily',
      'list',
      'textAlign',
      'colorPicker',
      'link',
      'embedded',
      // 'emoji',
      'image',
      'remove',
      'history',
    ],
    inline: {
      inDropdown: true,
      bold: { icon: <Icon icon="bold" />, component: <Icon icon="bold" /> },
    },
    list: { inDropdown: true },
    textAlign: { inDropdown: true },
    link: { inDropdown: true },
    history: { inDropdown: true },
    image: { uploadEnabled: false },
    colorPicker: {
      colors: values(
        pick(theme.rmwc, [
          'textPrimaryOnBackground',
          'textSecondaryOnBackground',
          'primary',
          'secondary',
          'surface',
          'error',
        ])
      ),
    },
  },
};
