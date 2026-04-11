#!/usr/bin/env python3
"""Convert side-quest lesson HTML files to printable versions."""

import re
import os
from html.parser import HTMLParser

BASE = "C:/Users/Kamron/claude-exp/cf-learn/learn"

FILES = [
    ("lessons/side-quests/build-something-new/android-app.html",
     "print/side-quests/build-something-new/android-app.html",
     "Build Something New"),
    ("lessons/side-quests/build-something-new/discord-bot.html",
     "print/side-quests/build-something-new/discord-bot.html",
     "Build Something New"),
    ("lessons/side-quests/build-something-new/encryption-hashing.html",
     "print/side-quests/build-something-new/encryption-hashing.html",
     "Build Something New"),
    ("lessons/side-quests/build-something-new/linux-basics.html",
     "print/side-quests/build-something-new/linux-basics.html",
     "Build Something New"),
    ("lessons/side-quests/build-something-new/multiplayer-quiz.html",
     "print/side-quests/build-something-new/multiplayer-quiz.html",
     "Build Something New"),
    ("lessons/side-quests/supercharge-resumator/apply-tracker.html",
     "print/side-quests/supercharge-resumator/apply-tracker.html",
     "Supercharge Resumator"),
    ("lessons/side-quests/supercharge-resumator/email-alerts.html",
     "print/side-quests/supercharge-resumator/email-alerts.html",
     "Supercharge Resumator"),
    ("lessons/side-quests/supercharge-resumator/interview-prep.html",
     "print/side-quests/supercharge-resumator/interview-prep.html",
     "Supercharge Resumator"),
    ("lessons/side-quests/supercharge-resumator/resume-tailor.html",
     "print/side-quests/supercharge-resumator/resume-tailor.html",
     "Supercharge Resumator"),
    ("lessons/side-quests/supercharge-resumator/salary-heatmap.html",
     "print/side-quests/supercharge-resumator/salary-heatmap.html",
     "Supercharge Resumator"),
]


def extract_title(html):
    """Extract lesson title from the <h1> tag."""
    m = re.search(r'<h1>(.*?)</h1>', html, re.DOTALL)
    if m:
        return m.group(1).strip()
    # Fallback to <title>
    m = re.search(r'<title>(?:Side Quest:\s*)?(.*?)\s*(?:—|&mdash;)\s*Coders Farm</title>', html)
    if m:
        return m.group(1).strip()
    return "Untitled"


def extract_estimated_time(html):
    """Extract estimated time from the lesson header."""
    m = re.search(r'Estimated time:\s*(.*?)(?:<|$)', html)
    if m:
        return m.group(1).strip()
    return ""


def extract_lesson_content(html):
    """Extract the main lesson content between lesson-content div and mark-complete-section."""
    # Find the start of lesson content
    start_m = re.search(r'<div class="lesson-content">\s*', html)
    if not start_m:
        return ""

    start = start_m.end()

    # Find end - before the closing </div> of lesson-content
    # We need to find the mark-complete-section or lesson-nav
    end_m = re.search(r'\s*</div>\s*<div class="mark-complete-section">', html[start:])
    if end_m:
        content = html[start:start + end_m.start()]
    else:
        # Try to find the closing </div> before lesson-nav
        end_m = re.search(r'\s*</div>\s*<div class="lesson-nav">', html[start:])
        if end_m:
            content = html[start:start + end_m.start()]
        else:
            content = html[start:]

    return content


def strip_sq_accent(content):
    """Remove side quest accent bar and label."""
    content = re.sub(r'\s*<div class="sq-accent-bar"></div>\s*', '\n', content)
    content = re.sub(r'\s*<span class="sq-label">Side Quest</span>\s*', '\n', content)
    return content


def convert_code_editors(content):
    """Convert code-editor divs to plain pre/code blocks."""
    # Match code-editor divs and extract inner pre/code
    def replace_editor(m):
        inner = m.group(1)
        # Extract the pre/code block
        pre_m = re.search(r'(<pre><code>.*?</code></pre>)', inner, re.DOTALL)
        if pre_m:
            return pre_m.group(1)
        return inner

    content = re.sub(
        r'<div class="code-editor"[^>]*>(.*?)</div>',
        replace_editor,
        content,
        flags=re.DOTALL
    )
    return content


def convert_quizzes(content):
    """Convert quiz blocks to static questions and collect answer key."""
    answers = []
    quiz_num = [0]

    def replace_quiz(m):
        quiz_html = m.group(0)
        quiz_num[0] += 1
        num = quiz_num[0]

        # Extract question
        q_m = re.search(r'<p class="quiz-question">(.*?)</p>', quiz_html, re.DOTALL)
        question = q_m.group(1).strip() if q_m else "Question"

        # Extract options
        options = re.findall(r'value="([a-z])">\s*(.*?)</label>', quiz_html, re.DOTALL)

        # Extract answer
        ans_m = re.search(r'data-correct="([a-z])">(.*?)</div>', quiz_html, re.DOTALL)
        correct_letter = ans_m.group(1) if ans_m else "?"
        explanation = ans_m.group(2).strip() if ans_m else ""
        # Clean HTML from explanation - just get first sentence or two
        explanation_clean = re.sub(r'<[^>]+>', '', explanation)
        if len(explanation_clean) > 200:
            explanation_clean = explanation_clean[:200].rsplit(' ', 1)[0] + '...'

        answers.append(f"{num}. {correct_letter} &mdash; {explanation_clean}")

        # Build static quiz
        result = f'<div class="quiz-box">\n'
        result += f'  <p><strong>Question {num}.</strong> {question}</p>\n'
        result += f'  <ol type="a">\n'
        for letter, text in options:
            text = text.strip()
            result += f'    <li>{text}</li>\n'
        result += f'  </ol>\n'
        result += f'</div>\n'

        return result

    content = re.sub(
        r'<div class="quiz-block"[^>]*>.*?</div>\s*</div>',
        replace_quiz,
        content,
        flags=re.DOTALL
    )

    return content, answers


def convert_key_concepts(content):
    """Keep key-concept divs but ensure they work for print."""
    # These should be fine as-is since print.css should handle them
    return content


def remove_html_comments(content):
    """Remove HTML comments (section markers)."""
    # Keep them - they're useful as section markers and invisible in print
    return content


def convert_file(src_path, dst_path, category):
    """Convert a single lesson file."""
    with open(src_path, 'r', encoding='utf-8') as f:
        html = f.read()

    title = extract_title(html)
    est_time = extract_estimated_time(html)
    content = extract_lesson_content(html)

    # Strip side quest accent bar and label
    content = strip_sq_accent(content)

    # Convert code editors to plain pre/code
    content = convert_code_editors(content)

    # Convert quizzes
    content, answers = convert_quizzes(content)

    # Clean up any remaining interactive elements
    # Remove data-editable, data-runnable attrs from any remaining elements
    content = re.sub(r'\s*data-editable="[^"]*"', '', content)
    content = re.sub(r'\s*data-runnable="[^"]*"', '', content)
    content = re.sub(r'\s*data-language="[^"]*"', '', content)

    # Build estimated time line
    est_line = f'  <p class="lesson-meta">Estimated time: {est_time}</p>\n' if est_time else ''

    # Build answer key
    answer_key = ''
    if answers:
        answer_key = '\n  <h2>Answer Key</h2>\n  <ol>\n'
        for a in answers:
            # Remove the leading number since we're in an <ol>
            a_text = re.sub(r'^\d+\.\s*', '', a)
            answer_key += f'    <li>{a_text}</li>\n'
        answer_key += '  </ol>\n'

    # Assemble output
    output = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{title} &mdash; Coders Farm</title>
  <link rel="stylesheet" href="../../print.css">
</head>
<body>
  <p class="lesson-meta">Side Quest &mdash; {category}</p>
  <h1>{title}</h1>
{est_line}
{content.rstrip()}
{answer_key}
</body>
</html>
'''

    # Clean up excessive blank lines
    output = re.sub(r'\n{4,}', '\n\n\n', output)

    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(output)

    print(f"  Converted: {os.path.basename(src_path)} ({len(answers)} quiz questions)")


def main():
    for src_rel, dst_rel, category in FILES:
        src = os.path.join(BASE, src_rel)
        dst = os.path.join(BASE, dst_rel)
        convert_file(src, dst, category)
    print("Done! All 10 files converted.")


if __name__ == '__main__':
    main()
