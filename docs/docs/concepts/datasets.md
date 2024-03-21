---
sidebar_position: 1
sidebar_label: Datasets
---

# Datasets

LexiClean supports three types of datasets, classified as either `standard` or `parallel` based on the dataset selection. It's crucial to note that LexiClean tokenizes texts using whitespace to create tokens that can be interacted with by annotators, therefore if any custom tokenization is required, it must be done outside of the application.

## Standard Dataset

A standard dataset consists of a corpus with texts separated by newlines.

```txt
Alicce was beginnning to get vvvery tired of sitting by her sister on the bankk.
So she wass considering in her owm mind, as welll as she could, for the hot day madde her feel verry sleepy and stupid.
Suddenly, a whiite rabbit with pink eyess ran close by her.
The rabit acttually took a watch outt of its waistcoat-pockett and loooked at it.
Burning with curiiosity, shee ran acrosss the field after it, wondering what could happen next.
```

## Standard Dataset with Identifiers

This dataset format requires [JSON](https://www.json.org/json-en.html), pairing each text with a unique identifier. This approach helps keep texts aligned with external databases or records. When the Drop Duplicates preprocessing option is employed, LexiClean combines identifiers of duplicate texts to reduce annotator workload while preserving links to the original inputs.

_Example JSON with unique identifiers:_

```json
[
  {
    "id": "ch01_pp10_11",
    "text": "Alicce was beginnning to get vvvery tired of sitting by her sister on the bankk."
  },
  {
    "id": "ch01_pp11_12",
    "text": "So she wass considering in her owm mind, as welll as she could, for the hot day madde her feel verry sleepy and stupid."
  }
]
```

_Example showing identifier handling post-lowercase preprocessing and duplicate removal:_

```json
[
  {
    "id": "1",
    "text": "REPLACE ENG"
  },
  // more texts
  {
    "id": "20",
    "text": "replace eng"
  }
]
```

_After processing:_

```json
[
  {
    "ids": ["1", "20"], // Includes any other identifiers that match the "text" post-processing.
    "text": "replace eng"
  }
]
```

## Parallel Reference Dataset

The parallel reference dataset is designed for projects that require maintaining original and modified text pairs, such as lexical normalisation error correction, translation or content masking projects. Due to its structure, preprocessing options are not applicable to this dataset type. When selected, the project is categorised as `parallel`.

This format is particularly useful for external preprocessing tasks, like regex-based masking, allowing for context preservation during text modifications. The source text remains untouched, serving as the reference, while the target text is editable within LexiClean, accommodating annotations or further modifications.

_Example format for parallel datasets:_

```json
[
  {
    "source": "ENG01 BLOWN GSKT - C/O",
    "target": "<id> blown gskt - c/o"
  }
  // Additional texts following the {"source": "", "target": ""} pattern
]
```
