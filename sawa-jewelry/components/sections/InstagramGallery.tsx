'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Share2, Heart } from 'lucide-react'

const posts = [
  {
    id: '1',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTRVcvv626Yt4WA_KGxNGPnSz8o38ayMDKW456wqgX_w&s=10',
    likes: '26.2K',
    handle: '@sawa_jewelry',
    url: 'https://www.tiktok.com/@sawa_bijouterie/photo/7427918478729940230?lang=fr',
  },
  {
    id: '2',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYUslW-FD6puzubu-oLos9Pogl5JKfIOKCCuiAxwyidA&s=10',
    likes: '15.3K',
    handle: '@sawa_jewelry',
    url: 'https://www.tiktok.com/@sawa_bijouterie/photo/7666143264864570632?lang=fr',
  },
  {
    id: '3',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5q4LZJJrYHOJBplOYK4k96cTDYx7ou2MKYU_piD8FVg&s=10',
    likes: '28.8K',
    handle: '@sawa_jewelry',
    url: 'https://www.tiktok.com/@sawa_bijouterie/photo/7648721738615753992?image_index=2',
  },
  {
    id: '4',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc3HQR1ugBzCNLwmVw8Boq2NqJ3-nNX7Avp79A_JBF7A&s=10',
    likes: '33.6K',
    handle: '@sawa_jewelry',
    url: 'https://www.tiktok.com/@sawa_bijouterie/photo/7629795381789986066?image_index=1',
  },
   {
    id: '5',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiCDz35ao9F3JgQcJ4n3DQIuHSUsWhx1SnFhFEXWqFqg&s=10',
    likes: '19.6K',
    handle: '@sawa_jewelry',
    url: 'https://www.tiktok.com/@sawa_bijouterie/photo/7598620911536753928?lang=fr',
  },
]

export function InstagramGallery() {
  return (
    <section className="relative border-t border-border/50 px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-primary font-mono text-xs uppercase tracking-widest mb-4">
            Follow Us
          </p>
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6">
            @sawa_jewelry
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Join our community and discover the latest collections and behind-the-scenes moments from our artisans.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post, index) => (
            <motion.a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Voir le post TikTok ${post.id} de ${post.handle}`}
              className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <Image
                src={post.image}
                alt={`Instagram post ${post.id}`}
                fill
                className="object-cover transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />

              <motion.div
                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 text-white">
                  <Heart className="w-5 h-5 fill-primary text-primary" />
                  <span className="font-mono font-semibold">{post.likes}</span>
                </div>
              </motion.div>
            </motion.a>
          ))}
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="https://www.tiktok.com/@sawa_bijouterie?lang=fr"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold hover:bg-primary/90 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="w-5 h-5" />
            Follow Our Collection
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
