import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CategoryBanner.css';

const cats = [
  {
    img: 'https://media.istockphoto.com/id/1412240771/photo/headphones-on-white-background.jpg?b=1&s=612x612&w=0&k=20&c=nh6m1Og0JhZgMvz5IY73WKgC9nCt8ZVvgY1Uk2PPL4M=',
    label: 'Music lovers on the go',
    sub: 'Wired & wireless',
    slug: 'audio',
    bg: '#1c1c1c',
  },
  {
    img: 'https://media.istockphoto.com/id/1563409200/photo/man-watching-tv-with-remote-control-in-hand.jpg?b=1&s=612x612&w=0&k=20&c=pDP-xS_LBLYmicDCd6N8BMy9n4EewiFi4cfd_r8kvfQ=',
    label: 'TVs & accessories',
    sub: 'Wide variety',
    slug: 'tv-streaming',
    bg: '#2c2c2c',
  },
  {
    img: 'https://images.pexels.com/photos/14740033/pexels-photo-14740033.jpeg',
    label: 'Games and consoles',
    sub: 'PS4 · PS5 · Xbox · Nintendo',
    slug: 'gaming',
    bg: '#1a1a2e',
  },
  {
    img: 'https://images.pexels.com/photos/16442035/pexels-photo-16442035.jpeg',
    label: 'Smartphones & tablets',
    sub: 'All top brands',
    slug: 'phones',
    bg: '#0f3460',
  },
  {
    img: 'https://images.pexels.com/photos/20432893/pexels-photo-20432893.jpeg',
    label: 'Laptops',
    sub: 'HP · Dell · Lenovo · Mac',
    slug: 'laptops',
    bg: '#1b2838',
  },
];

export default function CategoryBanner() {
  const navigate = useNavigate();

  return (
    <>
      <section className="cat-banner">
        {cats.map((c) => (
          <div
            key={c.label}
            className="cat-card"
            style={{ background: c.bg }}
            onClick={() => navigate(`/category/${c.slug}`)}
          >
            <img src={c.img} alt={c.label} />
            <div className="cat-arrow">→</div>
            <div className="cat-overlay">
              <div className="cat-sub">{c.sub}</div>
              <div className="cat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}