import React, { Component } from 'react';
import './NewsAndBlogs.css';

export class CardContent extends Component {
  render() {
    const { model, onArticleClick } = this.props;
    return (
      <>
        <div className="card-overlay"></div>
        <div className="card-badge">
          {model.type.toUpperCase()}
        </div>
        <div className="card-content">
          <h1 className="card-title">{model.title}</h1>
          <p className="card-desc">{model.description}</p>
          <p className="card-date">
            {new Date(model.date).toLocaleDateString('hu-HU')}
          </p>
          <button className="card-button" onClick={onArticleClick}>
            Olvasd el
          </button>
        </div>
      </>
    );
  }
}