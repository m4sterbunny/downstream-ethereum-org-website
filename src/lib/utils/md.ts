import fs from "fs"
import { join, extname } from "path"
import matter from "gray-matter"

import { CONTENT_DIR } from "@/lib/constants"
import { generateTableOfContents } from "@/lib/utils/toc"
import type { PageContent } from "@/lib/interfaces"

const CURRENT_CONTENT_DIR = join(process.cwd(), CONTENT_DIR)

const getPostSlugs = (dir: string, files: string[] = []) => {
  const contentDir = join(CURRENT_CONTENT_DIR, dir)
  // Temporal list of content pages allowed to be compiled
  // When a content page is migrated (and he components being used), should be added to this list
  const temporalAllowedPages = [
    "/about",
    "/bridges",
    "/community/code-of-conduct",
    "/community/events",
    "/community/support",
    "/energy-consumption",
    "/glossary",
    "/governance",
    "/guides/how-to-swap-tokens",
    "/history/",
    "/smart-contracts",
    "/whitepaper",
    "/defi",
    "/nft",
    "/dao",
    "/desci",
    "/refi",
    "/social-networks",
    "/decentralized-identity",
    "/roadmap",
    "/roadmap/future-proofing",
    "/roadmap/scaling",
    "/roadmap/security",
    "/roadmap/user-experience",
    "/roadmap/merge",
    "/roadmap/beacon-chain",
    "/roadmap/danksharding",
    "/roadmap/account-abstraction",
    "/roadmap/pbs",
    "/roadmap/single-slot-finality",
    "/roadmap/statelessness",
    "/roadmap/verkle-trees",
    "/developers/tutorials/all-you-can-cache",
  ]

  // Skip /translations dir for now until we set up i18n
  // Skip /developers dir for now until we set up required layout
  if (dir.includes("/translations")) return []

  // Get an array of all files and directories in the passed directory using
  // fs.readdirSync
  const fileList = fs.readdirSync(contentDir)

  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = join(contentDir, file)

    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the
      // directory path and the files array
      const nestedDir = join(dir, file)
      getPostSlugs(nestedDir, files)
    } else {
      const fileExtension = extname(name)

      if (fileExtension === ".md") {
        // If it is a .md file (allowed content page), push the path to the files array
        for (const page of temporalAllowedPages) {
          const fullPagePath = join(CURRENT_CONTENT_DIR, page)
          if (name.includes(fullPagePath)) {
            files.push(
              name.replace(CURRENT_CONTENT_DIR, "").replace("/index.md", "")
            )
          }
        }
      }
    }
  }

  return files
}

export const getContentBySlug = (slug: string) => {
  const realSlug = `${slug}/index.md`
  const fullPath = join(CURRENT_CONTENT_DIR, realSlug)
  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data: frontmatter, content } = matter(fileContents)

  const items: PageContent = {
    slug,
    content,
    frontmatter,
    tocItems: generateTableOfContents(content),
  }

  return items
}

export const getContent = (dir: string) => {
  const slugs = getPostSlugs(dir)
  const content = slugs.map(getContentBySlug)

  return content
}
