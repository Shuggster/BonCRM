import { motion } from "framer-motion";
import Image from "next/image";

interface ContactListItemProps {
  contact: {
    id: string;
    name: string;
    email: string;
    phone: string;
    tags: string[];
    imageUrl?: string;
  };
  isPinned?: boolean;
  onSelect: (id: string) => void;
}

export function ContactListItem({ contact, isPinned, onSelect }: ContactListItemProps) {
  return (
    <motion.div
      className="group flex items-center gap-4 p-4 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
      onClick={() => onSelect(contact.id)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Contact Image */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10">
        {contact.imageUrl ? (
          <Image
            src={contact.imageUrl}
            alt={contact.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-medium">
            {contact.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium truncate">{contact.name}</h3>
          {contact.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="text-sm text-white/50">
          <span className="mr-4">{contact.phone}</span>
          <span>{contact.email}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 hover:bg-white/10 rounded">
          ⋮
        </button>
      </div>
    </motion.div>
  );
} 