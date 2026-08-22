/// Human-readable labels for Quranic Arabic Corpus POS tags and feature codes
class MorphologyLabels {
  static const Map<String, String> posLabels = {
    'N': 'Noun',
    'PN': 'Proper Noun',
    'ADJ': 'Adjective',
    'ADV': 'Adverb',
    'V': 'Verb',
    'PRO': 'Pronoun',
    'PRON': 'Pronoun',
    'DEM': 'Demonstrative Pronoun',
    'REL': 'Relative Pronoun',
    'DET': 'Definite Article',
    'P': 'Preposition',
    'CONJ': 'Conjunction',
    'CCONJ': 'Coordinating Conjunction',
    'SUB': 'Subordinating Particle',
    'PART': 'Particle',
    'NEG': 'Negative Particle',
    'CERT': 'Certainty Particle',
    'EMPH': 'Emphasis Particle',
    'RET': 'Retraction Particle',
    'EXH': 'Exhortation Particle',
    'PREV': 'Preventive Particle',
    'INC': 'Inceptive Particle',
    'SUSP': 'Surprise Particle',
    'SUR': 'Surprise Particle',
    'AMD': 'Amendment Particle',
    'EXP': 'Explanation Particle',
    'INT': 'Interrogative Particle',
    'FUT': 'Future Particle',
    'RES': 'Resumption Particle',
    'VOC': 'Vocative Particle',
    'EXC': 'Exception Particle',
    'CIR': 'Circumstantial Particle',
    'IMPN': 'Imperative Noun',
    'T': 'Time Adverb',
    'LOC': 'Location Adverb',
    'CAUS': 'Causative Particle',
    'ACT_PCPL': 'Active Participle',
    'PASS_PCPL': 'Passive Participle',
    'VN': 'Verbal Noun',
    'INL': 'Letter',
  };

  static const Map<String, String> featureLabels = {
    // Case
    'NOM': 'Nominative',
    'GEN': 'Genitive',
    'ACC': 'Accusative',
    // Number
    'SG': 'Singular',
    'DU': 'Dual',
    'PL': 'Plural',
    // Gender
    'M': 'Masculine',
    'F': 'Feminine',
    // State
    'DEF': 'Definite',
    'INDEF': 'Indefinite',
    // Verb aspect
    'PERF': 'Perfect',
    'IMPF': 'Imperfect',
    'IMPV': 'Imperative',
    'IMP': 'Imperative',
    // Verb voice
    'ACT': 'Active',
    'PASS': 'Passive',
    // Verb mood
    'IND': 'Indicative',
    'SUBJ': 'Subjunctive',
    'JUS': 'Jussive',
    // Person
    '1P': '1st Person',
    '2P': '2nd Person',
    '3P': '3rd Person',
    // Pronoun/suffix specifics
    '1S': '1st Person Singular',
    '2MS': '2nd Person Masculine Singular',
    '2FS': '2nd Person Feminine Singular',
    '3MS': '3rd Person Masculine Singular',
    '3FS': '3rd Person Feminine Singular',
    '2D': '2nd Person Dual',
    '2MD': '2nd Person Masculine Dual',
    '2FD': '2nd Person Feminine Dual',
    '3D': '3rd Person Dual',
    '3MD': '3rd Person Masculine Dual',
    '3FD': '3rd Person Feminine Dual',
    '2MP': '2nd Person Masculine Plural',
    '2FP': '2nd Person Feminine Plural',
    '3MP': '3rd Person Masculine Plural',
    '3FP': '3rd Person Feminine Plural',
    // Gender+number with no person marker (nouns/adjectives/participles)
    'MS': 'Masculine Singular',
    'MP': 'Masculine Plural',
    'MD': 'Masculine Dual',
    'FS': 'Feminine Singular',
    'FP': 'Feminine Plural',
    'FD': 'Feminine Dual',
    // Particle functions
    'NEG': 'Negative',
    'COND': 'Conditional',
    'CERT': 'Certainty',
    'INTG': 'Interrogative',
    'T': 'Time Adverb',
    'NV': 'Noun Functioning as Verb',
    'ANS': 'Answer Particle',
    'ATT': 'Attention Particle',
    'EXL': 'Detailing Particle',
    'AVR': 'Aversion Particle',
    'SUP': 'Supplemental Particle',
    // Governance groups ("sisters" of a governing particle/verb)
    'FAM:إِنّ': "Sister of 'inna' (governs like إِنّ)",
    'FAM:كَان': "Sister of 'kāna' (governs like كَانَ)",
    'FAM:كَاد': "Sister of 'kāda' (verbs of imminence)",
  };

  static const Map<String, String> vfLabels = {
    '1': 'Form I',
    '2': 'Form II',
    '3': 'Form III',
    '4': 'Form IV',
    '5': 'Form V',
    '6': 'Form VI',
    '7': 'Form VII',
    '8': 'Form VIII',
    '9': 'Form IX',
    '10': 'Form X',
    '11': 'Form XI',
  };

  static const Map<String, String> moodLabels = {
    'IND': 'Indicative',
    'SUBJ': 'Subjunctive',
    'JUS': 'Jussive',
  };

  static String humanizePOS(String pos) {
    return posLabels[pos] ?? pos;
  }

  static List<String> humanizeFeatures(List<String> features) {
    return features
        .where((f) => f.isNotEmpty && f != 'SP' && f != 'PART')
        .map((f) {
      if (f.startsWith('VF:')) return vfLabels[f.substring(3)] ?? f;
      if (f.startsWith('MOOD:')) return moodLabels[f.substring(5)] ?? f.substring(5);
      // Some feature codes reuse the same particle-role vocabulary as POS
      // tags (e.g. a word tagged pos:"P" carries features:["RES"] to record
      // its specific role) — fall back to posLabels before giving up.
      return featureLabels[f] ?? posLabels[f] ?? f;
    }).toList();
  }
}
