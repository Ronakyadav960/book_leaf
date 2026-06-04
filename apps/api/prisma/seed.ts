import bcrypt from "bcryptjs";
import type { BookStatus, TicketCategory, TicketPriority } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SampleBook = {
  book_id: string;
  title: string;
  isbn: string;
  genre: string;
  publication_date: string | null;
  status: string;
  mrp: number | null;
  total_copies_sold: number;
  total_royalty_earned: number;
  royalty_paid: number;
  royalty_pending: number;
};

type SampleAuthor = {
  author_id: string;
  name: string;
  email: string;
  joined_date: string;
  books: SampleBook[];
};

const sampleAuthors: SampleAuthor[] = [
  {
    author_id: "AUTH001",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    joined_date: "2023-03-15",
    books: [
      { book_id: "BK001", title: "Whispers of the Ganges", isbn: "978-93-5XXXX-01-1", genre: "Literary Fiction", publication_date: "2023-06-20", status: "Published & Live", mrp: 399, total_copies_sold: 342, total_royalty_earned: 11970, royalty_paid: 8400, royalty_pending: 3570 },
      { book_id: "BK002", title: "The Saffron Diaries", isbn: "978-93-5XXXX-02-8", genre: "Non-Fiction / Memoir", publication_date: "2024-01-10", status: "Published & Live", mrp: 450, total_copies_sold: 189, total_royalty_earned: 7938, royalty_paid: 7938, royalty_pending: 0 }
    ]
  },
  {
    author_id: "AUTH002",
    name: "Rohit Kapoor",
    email: "rohit.kapoor@email.com",
    joined_date: "2022-11-08",
    books: [
      { book_id: "BK003", title: "Code & Karma", isbn: "978-93-5XXXX-03-5", genre: "Self-Help / Technology", publication_date: "2023-02-14", status: "Published & Live", mrp: 350, total_copies_sold: 876, total_royalty_earned: 26280, royalty_paid: 21000, royalty_pending: 5280 },
      { book_id: "BK004", title: "Startup Sutra", isbn: "978-93-5XXXX-04-2", genre: "Business / Entrepreneurship", publication_date: "2024-05-22", status: "Published & Live", mrp: 499, total_copies_sold: 1203, total_royalty_earned: 57744, royalty_paid: 50000, royalty_pending: 7744 }
    ]
  },
  {
    author_id: "AUTH003",
    name: "Ananya Reddy",
    email: "ananya.reddy@email.com",
    joined_date: "2024-02-20",
    books: [
      { book_id: "BK005", title: "Between Two Temples", isbn: "978-93-5XXXX-05-9", genre: "Historical Fiction", publication_date: "2024-07-05", status: "Published & Live", mrp: 425, total_copies_sold: 67, total_royalty_earned: 2546, royalty_paid: 0, royalty_pending: 2546 }
    ]
  },
  {
    author_id: "AUTH004",
    name: "Vikram Joshi",
    email: "vikram.joshi@email.com",
    joined_date: "2023-07-12",
    books: [
      { book_id: "BK006", title: "Debugging Life", isbn: "978-93-5XXXX-06-6", genre: "Self-Help", publication_date: "2023-11-30", status: "Published & Live", mrp: 299, total_copies_sold: 534, total_royalty_earned: 13350, royalty_paid: 10000, royalty_pending: 3350 },
      { book_id: "BK007", title: "The Last Monsoon", isbn: "978-93-5XXXX-07-3", genre: "Poetry", publication_date: "2024-08-15", status: "Published & Live", mrp: 199, total_copies_sold: 123, total_royalty_earned: 1845, royalty_paid: 1845, royalty_pending: 0 }
    ]
  },
  {
    author_id: "AUTH005",
    name: "Meera Nair",
    email: "meera.nair@email.com",
    joined_date: "2023-01-05",
    books: [
      { book_id: "BK008", title: "Cardamom & Chaos", isbn: "978-93-5XXXX-08-0", genre: "Contemporary Fiction", publication_date: "2023-04-18", status: "Published & Live", mrp: 375, total_copies_sold: 445, total_royalty_earned: 14240, royalty_paid: 14240, royalty_pending: 0 },
      { book_id: "BK009", title: "Letters from Lakshadweep", isbn: "978-93-5XXXX-09-7", genre: "Travel / Non-Fiction", publication_date: "2024-03-01", status: "Published & Live", mrp: 550, total_copies_sold: 201, total_royalty_earned: 11055, royalty_paid: 8000, royalty_pending: 3055 }
    ]
  },
  {
    author_id: "AUTH006",
    name: "Arjun Malhotra",
    email: "arjun.malhotra@email.com",
    joined_date: "2024-06-01",
    books: [
      { book_id: "BK010", title: "Turban Tales", isbn: "978-93-5XXXX-10-3", genre: "Humor / Essays", publication_date: "2024-09-10", status: "Published & Live", mrp: 325, total_copies_sold: 88, total_royalty_earned: 2464, royalty_paid: 0, royalty_pending: 2464 }
    ]
  },
  {
    author_id: "AUTH007",
    name: "Sneha Kulkarni",
    email: "sneha.kulkarni@email.com",
    joined_date: "2022-09-18",
    books: [
      { book_id: "BK011", title: "The Algorithm of Love", isbn: "978-93-5XXXX-11-0", genre: "Romance", publication_date: "2022-12-25", status: "Published & Live", mrp: 299, total_copies_sold: 1567, total_royalty_earned: 39175, royalty_paid: 35000, royalty_pending: 4175 },
      { book_id: "BK012", title: "Ctrl+Alt+Delete My Ex", isbn: "978-93-5XXXX-12-7", genre: "Romance / Humor", publication_date: "2024-02-14", status: "Published & Live", mrp: 350, total_copies_sold: 723, total_royalty_earned: 21690, royalty_paid: 18000, royalty_pending: 3690 },
      { book_id: "BK013", title: "Midnight in Mysore", isbn: "978-93-5XXXX-13-4", genre: "Thriller", publication_date: null, status: "In Production - Cover Design", mrp: null, total_copies_sold: 0, total_royalty_earned: 0, royalty_paid: 0, royalty_pending: 0 }
    ]
  },
  {
    author_id: "AUTH008",
    name: "Farhan Sheikh",
    email: "farhan.sheikh@email.com",
    joined_date: "2023-10-01",
    books: [
      { book_id: "BK014", title: "Ghazal of the Forgotten", isbn: "978-93-5XXXX-14-1", genre: "Poetry / Urdu Literature", publication_date: "2024-01-26", status: "Published & Live", mrp: 250, total_copies_sold: 156, total_royalty_earned: 3120, royalty_paid: 3120, royalty_pending: 0 }
    ]
  },
  {
    author_id: "AUTH009",
    name: "Kavita Deshmukh",
    email: "kavita.deshmukh@email.com",
    joined_date: "2024-04-10",
    books: [
      { book_id: "BK015", title: "Raising Roots", isbn: "978-93-5XXXX-15-8", genre: "Parenting / Non-Fiction", publication_date: null, status: "In Production - Typesetting", mrp: null, total_copies_sold: 0, total_royalty_earned: 0, royalty_paid: 0, royalty_pending: 0 },
      { book_id: "BK016", title: "The Nagpur Notebooks", isbn: "978-93-5XXXX-16-5", genre: "Essays / Memoir", publication_date: "2024-11-05", status: "Published & Live", mrp: 299, total_copies_sold: 34, total_royalty_earned: 850, royalty_paid: 0, royalty_pending: 850 }
    ]
  },
  {
    author_id: "AUTH010",
    name: "Diya Chatterjee",
    email: "diya.chatterjee@email.com",
    joined_date: "2023-05-22",
    books: [
      { book_id: "BK017", title: "Durga's Daughters", isbn: "978-93-5XXXX-17-2", genre: "Literary Fiction", publication_date: "2023-10-15", status: "Published & Live", mrp: 475, total_copies_sold: 612, total_royalty_earned: 27540, royalty_paid: 25000, royalty_pending: 2540 },
      { book_id: "BK018", title: "Howrah Nights", isbn: "978-93-5XXXX-18-9", genre: "Crime / Thriller", publication_date: "2025-01-20", status: "Published & Live", mrp: 399, total_copies_sold: 45, total_royalty_earned: 1575, royalty_paid: 0, royalty_pending: 1575 }
    ]
  }
];

const sampleTickets = [
  {
    authorEmail: "priya.sharma@email.com",
    isbn: "978-93-5XXXX-01-1",
    subject: "Royalty payment pending for latest quarter",
    description: "My dashboard shows pending royalty for Whispers of the Ganges, but I have not received the latest quarterly payout yet. Please check my bank transfer status.",
    category: "ROYALTY_PAYMENTS" as TicketCategory,
    priority: "HIGH" as TicketPriority
  },
  {
    authorEmail: "rohit.kapoor@email.com",
    isbn: "978-93-5XXXX-04-2",
    subject: "Amazon listing shows unavailable",
    description: "Startup Sutra is showing as Currently Unavailable on Amazon India even though it is published and live. Please trigger a stock sync.",
    category: "DISTRIBUTION_AVAILABILITY" as TicketCategory,
    priority: "MEDIUM" as TicketPriority
  },
  {
    authorEmail: "sneha.kulkarni@email.com",
    isbn: "978-93-5XXXX-13-4",
    subject: "Cover design stage has not moved",
    description: "Midnight in Mysore has been in cover design for three weeks. I need an updated production timeline and next step from the team.",
    category: "BOOK_STATUS_PRODUCTION" as TicketCategory,
    priority: "MEDIUM" as TicketPriority
  },
  {
    authorEmail: "diya.chatterjee@email.com",
    isbn: "978-93-5XXXX-17-2",
    subject: "ISBN mismatch on Amazon page",
    description: "Durga's Daughters is showing a different ISBN on the Amazon listing than the ISBN printed on my author copy. This needs urgent correction.",
    category: "ISBN_METADATA" as TicketCategory,
    priority: "CRITICAL" as TicketPriority
  }
];

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  await clearData();

  const admin = await prisma.user.create({
    data: { name: "Aditi Rao", email: "admin@bookleaf.com", passwordHash, role: "ADMIN" }
  });

  const authorIds = new Map<string, string>();
  for (const author of sampleAuthors) {
    const created = await prisma.user.create({
      data: {
        name: author.name,
        email: author.email,
        passwordHash,
        role: "AUTHOR",
        createdAt: new Date(author.joined_date)
      }
    });
    authorIds.set(author.email, created.id);

    for (const book of author.books) {
      await prisma.book.create({
        data: {
          authorId: created.id,
          title: book.title,
          isbn: book.isbn,
          genre: book.genre,
          publicationDate: book.publication_date ? new Date(book.publication_date) : null,
          status: mapBookStatus(book.status),
          mrp: book.mrp ?? 0,
          copiesSold: book.total_copies_sold,
          royaltyEarned: book.total_royalty_earned,
          royaltyPaid: book.royalty_paid,
          royaltyPending: book.royalty_pending
        }
      });
    }
  }

  for (const ticket of sampleTickets) {
    const authorId = authorIds.get(ticket.authorEmail);
    if (!authorId) continue;
    const book = await prisma.book.findUnique({ where: { isbn: ticket.isbn } });
    if (!book) continue;
    await prisma.ticket.create({
      data: {
        authorId,
        bookId: book.id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.priority === "CRITICAL" ? "ESCALATED" : "OPEN",
        priority: ticket.priority,
        category: ticket.category,
        escalated: ticket.priority === "CRITICAL",
        department: departmentFor(ticket.category),
        aiAnalysis: {
          create: {
            summary: ticket.subject,
            category: ticket.category,
            categoryConfidence: 0.88,
            priority: ticket.priority,
            priorityConfidence: 0.82,
            escalationRequired: ticket.priority === "CRITICAL",
            department: departmentFor(ticket.category),
            suggestedActions: suggestedActionsFor(ticket.category),
            draftResponse: draftFor(ticket.category, book.title),
            retrievedContext: [],
            serviceAvailable: true
          }
        },
        assignments: ticket.priority === "CRITICAL" ? { create: { adminId: admin.id } } : undefined,
        responses: ticket.priority === "CRITICAL" ? { create: { authorId: admin.id, message: "We have escalated this to the metadata team and will review the ISBN mapping within 48 hours." } } : undefined,
        notes: ticket.priority === "CRITICAL" ? { create: { authorId: admin.id, note: "ISBN mismatch should be treated as urgent metadata correction." } } : undefined,
        statusHistory: { create: { to: ticket.priority === "CRITICAL" ? "ESCALATED" : "OPEN" } }
      }
    });
  }

  console.log("Seed complete: 1 admin, 10 authors, 18 books, 4 tickets");
  console.log("Admin login: admin@bookleaf.com / Password123!");
  console.log("Sample author login: priya.sharma@email.com / Password123!");
}

async function clearData() {
  await prisma.notification.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.internalNote.deleteMany();
  await prisma.ticketResponse.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.aiAnalysis.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
}

function mapBookStatus(status: string): BookStatus {
  return status.startsWith("Published") ? "PUBLISHED" : "IN_PRODUCTION";
}

function departmentFor(category: TicketCategory) {
  if (category === "ROYALTY_PAYMENTS") return "FINANCE";
  if (category === "ISBN_METADATA") return "METADATA";
  if (category === "DISTRIBUTION_AVAILABILITY") return "DISTRIBUTION";
  if (category === "PRINTING_QUALITY" || category === "BOOK_STATUS_PRODUCTION") return "PRODUCTION";
  return "SUPPORT";
}

function suggestedActionsFor(category: TicketCategory) {
  const actions: Record<TicketCategory, string[]> = {
    ROYALTY_PAYMENTS: ["Verify quarterly royalty calculation", "Check bank payout status", "Share payout timeline with author"],
    ISBN_METADATA: ["Compare ISBN in dashboard and marketplace", "Escalate to metadata team", "Confirm correction within 48 hours"],
    PRINTING_QUALITY: ["Request defect photos", "Verify issue with print partner", "Arrange reprint if confirmed"],
    DISTRIBUTION_AVAILABILITY: ["Check marketplace stock sync", "Trigger distribution re-sync", "Confirm availability in 24-48 hours"],
    BOOK_STATUS_PRODUCTION: ["Review current production stage", "Check pending approvals", "Provide updated timeline"],
    GENERAL_INQUIRY: ["Review account context", "Send acknowledgement", "Share next step"]
  };
  return actions[category];
}

function draftFor(category: TicketCategory, title: string) {
  const drafts: Record<TicketCategory, string> = {
    ROYALTY_PAYMENTS: `Thank you for flagging this. I will review the royalty statement, payout status, and linked bank details for ${title}, then share the next payout update or escalate it to finance if the transfer is overdue.`,
    ISBN_METADATA: `Thank you for reporting this. An ISBN mismatch is a serious metadata issue, so we are escalating ${title} to the metadata team immediately and will work toward a correction update within 48 hours.`,
    PRINTING_QUALITY: `I am sorry the print quality did not meet expectations. Please share photos of the affected copy so our team can verify the issue and arrange a free reprint if confirmed.`,
    DISTRIBUTION_AVAILABILITY: `Thank you for letting us know. This is usually a marketplace stock sync issue, so we will trigger a distribution re-sync for ${title} and monitor availability over the next 24-48 hours.`,
    BOOK_STATUS_PRODUCTION: `Thank you for checking in. We will review the current production stage for ${title}, confirm whether any approvals are pending, and share a specific updated timeline.`,
    GENERAL_INQUIRY: "Thank you for reaching out. Our support team will review your account context and share the next step shortly."
  };
  return drafts[category];
}

main().finally(() => prisma.$disconnect());
