import article_1  from './articles/rte_content_1.json';



const articles = [
  { id: '2',  content: article_1  },

];

export function seedArticles() {
  articles.forEach(({ id, content }) => {
    const key = `rte_content_${id}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(content));
    }
  });
}