import React from 'react';
import { useNavigate } from 'react-router-dom';

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
      <style>{`
        .cat-banner {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          height: 340px;
          background: #111;
        }
        .cat-card {
          position: relative;
          cursor: pointer;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform .3s;
        }
        .cat-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .5s, filter .3s;
          filter: brightness(0.55);
        }
        .cat-card:hover img {
          transform: scale(1.1);
          filter: brightness(0.75);
        }
        .cat-arrow {
          position: absolute;
          top: 16px; right: 16px;
          background: #0097a7;
          color: #fff;
          width: 34px; height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          opacity: 0;
          transform: translateY(-4px);
          transition: all .3s;
          z-index: 2;
        }
        .cat-card:hover .cat-arrow {
          opacity: 1;
          transform: translateY(0);
        }
        .cat-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 20px 16px;
          background: linear-gradient(transparent, rgba(0,0,0,0.85));
          z-index: 1;
        }
        .cat-sub {
          font-size: 10px;
          color: #0097a7;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 4px;
          font-weight: 700;
        }
        .cat-label {
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          line-height: 1.3;
          text-transform: uppercase;
        }

        @media (max-width: 900px) {
          .cat-banner {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(3, 200px);
            height: auto;
          }
          .cat-card:nth-child(5) {
            grid-column: 1 / 3;
          }
        }
        @media (max-width: 480px) {
          .cat-banner {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(5, 180px);
          }
          .cat-card:nth-child(5) {
            grid-column: auto;
          }
        }
      `}</style>

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