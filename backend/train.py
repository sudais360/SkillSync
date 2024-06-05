import spacy
import random
from spacy.training import Example
import os

# Training data focused on Name, Phone, Email, and Address
TRAIN_DATA = [
    ("My name is Mohamed Sudais SO Sabeer Ahamed. You can contact me at mohamedsudais360@gmail.com or +65 8806 4911. I live at 123 Main St, Singapore.", 
     {"entities": [(11, 42, "NAME"), (61, 85, "EMAIL"), (90, 103, "PHONE"), (113, 132, "ADDRESS")]}),
    ("Contact: Jane Doe, Email: jane.doe@example.com, Phone: +1 234 567 8901, Address: 456 Elm St, Springfield", 
     {"entities": [(9, 17, "NAME"), (25, 43, "EMAIL"), (52, 66, "PHONE"), (76, 99, "ADDRESS")]}),
    ("Name: John Doe, Email: john.doe@example.com, Phone: (123) 456-7890, Address: 789 Oak St, Metropolis", 
     {"entities": [(6, 14, "NAME"), (22, 40, "EMAIL"), (49, 63, "PHONE"), (73, 96, "ADDRESS")]}),
    ("Reach me at mohamedsudais360@gmail.com or call +65 8806 4911. My home is at 123 Main St, Singapore.",
     {"entities": [(11, 35, "EMAIL"), (45, 58, "PHONE"), (72, 91, "ADDRESS")]}),
    ("Phone: +65 8806 4911, Email: mohamedsudais360@gmail.com, Name: Mohamed Sudais SO Sabeer Ahamed, Address: 123 Main St, Singapore", 
     {"entities": [(7, 20, "PHONE"), (28, 52, "EMAIL"), (60, 91, "NAME"), (101, 120, "ADDRESS")]}),
    ("John Smith, john.smith@example.com, (321) 654-0987, 101 First Ave, Anytown", 
     {"entities": [(0, 10, "NAME"), (12, 32, "EMAIL"), (34, 48, "PHONE"), (50, 70, "ADDRESS")]}),
    ("For more information, contact Jane Doe at janedoe123@example.com or +44 20 7946 0958. She lives at 22 Baker St, London.", 
     {"entities": [(28, 36, "NAME"), (40, 60, "EMAIL"), (64, 78, "PHONE"), (91, 108, "ADDRESS")]}),
    ("Jane Smith, Email: jane.smith@example.com, Phone: +1-800-555-5555, Address: 500 Fifth Ave, New York, NY 10018", 
     {"entities": [(0, 10, "NAME"), (18, 38, "EMAIL"), (47, 63, "PHONE"), (74, 98, "ADDRESS")]}),
]

def train_spacy(data, iterations):
    nlp = spacy.blank('en')  # create blank Language class
    if 'ner' not in nlp.pipe_names:
        ner = nlp.add_pipe('ner', last=True)

    for _, annotations in data:
        for ent in annotations.get('entities'):
            ner.add_label(ent[2])

    other_pipes = [pipe for pipe in nlp.pipe_names if pipe != 'ner']
    with nlp.disable_pipes(*other_pipes):  # only train NER
        optimizer = nlp.begin_training()
        for itn in range(iterations):
            print(f"Starting iteration {itn}")
            random.shuffle(data)
            losses = {}
            for text, annotations in data:
                doc = nlp.make_doc(text)
                example = Example.from_dict(doc, annotations)
                nlp.update(
                    [example],  # batch of Example objects
                    drop=0.2,  # dropout - make it harder to memorise data
                    sgd=optimizer,  # callable to update weights
                    losses=losses)
            print(losses)
    return nlp

# Train the model
prdnlp = train_spacy(TRAIN_DATA, 20)

# Save the trained model to disk
model_path = os.path.join(os.path.dirname(__file__), "custom_ner_model")
prdnlp.to_disk(model_path)
print(f"Model saved to {os.path.abspath(model_path)}")

# Optionally, test the trained model
def test_model(model_path, test_text):
    nlp = spacy.load(model_path)
    doc = nlp(test_text)
    for ent in doc.ents:
        print(ent.text, ent.start_char, ent.end_char, ent.label_)

test_text = "My name is Mohamed Sudais SO Sabeer Ahamed. You can contact me at mohamedsudais360@gmail.com or +65 8806 4911. I live at 123 Main St, Singapore."
test_model(model_path, test_text)
