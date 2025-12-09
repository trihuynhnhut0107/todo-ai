import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display'; 


interface AIMessageRendererProps {
  content: string;
}

const AIMessageRenderer: React.FC<AIMessageRendererProps> = ({ content }) => {
  const messageText = useMemo(() => {
    try {
      if (content && content.trim().startsWith('{')) {
        const parsed = JSON.parse(content);
        return parsed.response || content;
      }
      return content;
    } catch (error) {
      return content;
    }
  }, [content]);

  return (
      <Markdown style={markdownStyles}>
        {messageText}
      </Markdown>
  );
};


const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    color: '#333',
    lineHeight: 18,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
    flexWrap: 'wrap',
  },
  strong: {
    fontWeight: 'bold',
    color: '#000',
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  bullet_list: {
    marginVertical: 4,
  },
  list_item: {
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet_list_icon: {
    marginLeft: 10,
    marginRight: 10,
    fontSize: 20,
    lineHeight: 20,
  },
  ordered_list_icon: {
    marginLeft: 10,
    marginRight: 10,
    fontSize: 16, 
    fontWeight: 'bold',
    lineHeight: 20, 
    color: '#333',
  },
  list_item_content: {
    flex: 1,
  },
  ordered_list_content: {
    flex: 1,
  },
  hr: {
    backgroundColor: '#e0e0e0',
    height: 1,
    marginVertical: 12,
  },
});

export default AIMessageRenderer;